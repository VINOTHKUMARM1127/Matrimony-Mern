/**
 * Wedring Backend — Distribution Service
 *
 * Handles initial and daily profile distribution to user feeds.
 * Idempotent: checks user_distribution_state before running.
 */
import { supabaseAdmin } from '../../config/supabase.js';
import { sendPush } from '../notifications/notifications.service.js';
import logger from '../../utils/logger.js';

/**
 * Run initial distribution for a user at a given tier.
 * Idempotent: skips if initial_done=true for this tier.
 */
export async function runInitialDistribution(userId, tier) {
  // Check distribution state
  const { data: state } = await supabaseAdmin
    .from('user_distribution_state')
    .select('*')
    .eq('user_id', userId)
    .eq('tier', tier)
    .maybeSingle();

  if (state?.initial_done) {
    logger.debug(`Initial distribution already done for user ${userId}, tier ${tier}`);
    return { skipped: true };
  }

  // Get distribution config for tier
  const { data: config } = await supabaseAdmin
    .from('distribution_config')
    .select('*')
    .eq('tier', tier)
    .maybeSingle();

  if (!config) {
    logger.warn(`No distribution config for tier: ${tier}`);
    return { skipped: true, reason: 'no_config' };
  }

  // Fetch user's profile for gender matching
  const { data: userProfile } = await supabaseAdmin
    .from('profiles')
    .select('gender, religion, caste, state, district')
    .eq('user_id', userId)
    .maybeSingle();

  const oppositeGender = userProfile?.gender === 'Male' ? 'Female' : 'Male';

  // Get already distributed profile IDs for this user
  const { data: existingDist } = await supabaseAdmin
    .from('user_distributed_profiles')
    .select('profile_id')
    .eq('user_id', userId);

  const excludeIds = new Set((existingDist || []).map(d => d.profile_id));
  excludeIds.add(userId); // Exclude self

  // Get not-interested IDs
  const { data: notInterested } = await supabaseAdmin
    .from('not_interested')
    .select('target_user_id')
    .eq('user_id', userId);

  (notInterested || []).forEach(ni => excludeIds.add(ni.target_user_id));

  // Fetch eligible profiles
  let query = supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('gender', oppositeGender)
    .not('user_id', 'in', `(${Array.from(excludeIds).join(',')})`)
    .order('created_at', { ascending: false });

  // Apply basic preference matching if available
  const { data: prefs } = await supabaseAdmin
    .from('partner_preferences')
    .select('religion, caste')
    .eq('user_id', userId)
    .maybeSingle();

  if (prefs?.religion && prefs.religion.length > 0) {
    query = query.in('religion', prefs.religion);
  }

  const allMatchesCount = config.initial_count || 50;
  const dailyCount = config.daily_count || 5;

  // Fetch for all_matches section
  const { data: allMatchProfiles } = await query.limit(allMatchesCount);

  // Insert into user_distributed_profiles
  const now = new Date().toISOString();
  const rows = [];

  (allMatchProfiles || []).forEach((p, i) => {
    rows.push({
      user_id: userId,
      profile_id: p.user_id,
      section: 'all_matches',
      distributed_at: now,
      is_new: true,
    });
  });

  // Also pick a subset for daily_updates
  const dailyProfiles = (allMatchProfiles || []).slice(0, dailyCount);
  dailyProfiles.forEach(p => {
    rows.push({
      user_id: userId,
      profile_id: p.user_id,
      section: 'daily_updates',
      distributed_at: now,
      is_new: true,
    });
  });

  if (rows.length > 0) {
    const { error: insertErr } = await supabaseAdmin
      .from('user_distributed_profiles')
      .insert(rows);

    if (insertErr) {
      logger.error('Distribution insert error:', insertErr.message);
    } else {
      await supabaseAdmin.from('distribution_logs').insert({
        user_id: userId,
        tier: tier,
        distribution_type: 'initial',
        section: 'both',
        profiles_added: rows.length / 2, // approximation
        distributed_at: now,
      });
    }
  }

  // Mark initial done
  await supabaseAdmin.from('user_distribution_state').upsert({
    user_id: userId,
    tier,
    initial_done: true,
    last_daily_run: new Date().toISOString().split('T')[0],
    updated_at: now,
  }, { onConflict: 'user_id,tier' });

  // Send push notification
  if (rows.length > 0) {
    sendPush(userId, {
      title: 'New Profiles! 🌟',
      body: `${(allMatchProfiles || []).length} new profiles are waiting for you.`,
      type: 'new_profiles',
    }).catch(() => {});
  }

  logger.info(`Initial distribution: ${rows.length} profiles distributed to user ${userId} (tier: ${tier})`);
  return { distributed: rows.length };
}

/**
 * Run daily distribution for a user
 */
export async function runDailyDistribution(userId, tier) {
  // Get distribution config
  const { data: config } = await supabaseAdmin
    .from('distribution_config')
    .select('*')
    .eq('tier', tier)
    .maybeSingle();

  if (!config) return { skipped: true };

  const dailyCount = config.daily_count || 5;

  // Get already distributed profile IDs
  const { data: existingDist } = await supabaseAdmin
    .from('user_distributed_profiles')
    .select('profile_id')
    .eq('user_id', userId);

  const excludeIds = new Set((existingDist || []).map(d => d.profile_id));
  excludeIds.add(userId);

  // Get not-interested IDs
  const { data: notInterested } = await supabaseAdmin
    .from('not_interested')
    .select('target_user_id')
    .eq('user_id', userId);

  (notInterested || []).forEach(ni => excludeIds.add(ni.target_user_id));

  // Get user gender
  const { data: userProfile } = await supabaseAdmin
    .from('profiles')
    .select('gender')
    .eq('user_id', userId)
    .maybeSingle();

  const oppositeGender = userProfile?.gender === 'Male' ? 'Female' : 'Male';

  // Fetch new eligible profiles
  const excludeArray = Array.from(excludeIds);
  let query = supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('gender', oppositeGender)
    .order('created_at', { ascending: false })
    .limit(dailyCount);

  if (excludeArray.length > 0) {
    query = query.not('user_id', 'in', `(${excludeArray.join(',')})`);
  }

  const { data: newProfiles } = await query;

  if (!newProfiles || newProfiles.length === 0) {
    return { distributed: 0 };
  }

  // Insert as new profiles at top
  const now = new Date().toISOString();
  const rows = [];

  newProfiles.forEach(p => {
    rows.push({
      user_id: userId,
      profile_id: p.user_id,
      section: 'all_matches',
      distributed_at: now,
      is_new: true,
    });
    rows.push({
      user_id: userId,
      profile_id: p.user_id,
      section: 'daily_updates',
      distributed_at: now,
      is_new: true,
    });
  });

  if (rows.length > 0) {
    await supabaseAdmin.from('user_distributed_profiles').insert(rows);
    await supabaseAdmin.from('distribution_logs').insert({
      user_id: userId,
      tier: tier,
      distribution_type: 'daily',
      section: 'both',
      profiles_added: newProfiles.length,
      distributed_at: now,
    });
  }

  // Update distribution state
  await supabaseAdmin
    .from('user_distribution_state')
    .upsert({
      user_id: userId,
      tier,
      last_daily_run: new Date().toISOString().split('T')[0],
      updated_at: now,
    }, { onConflict: 'user_id,tier' });

  return { distributed: newProfiles.length };
}

/**
 * Manual distribution (admin-triggered)
 */
export async function manualDistribution({ target, tier, userId: targetUserId, section, count }) {
  let userIds = [];

  if (target === 'user' && targetUserId) {
    userIds = [targetUserId];
  } else if (target === 'tier' && tier) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('membership_tier', tier)
      .eq('is_active', true);
    userIds = (users || []).map(u => u.id);
  } else if (target === 'all') {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('is_active', true);
    userIds = (users || []).map(u => u.id);
  }

  let totalDistributed = 0;

  for (const uid of userIds) {
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('gender')
        .eq('user_id', uid)
        .maybeSingle();

      const oppositeGender = userProfile?.gender === 'Male' ? 'Female' : 'Male';

      // Get existing distributed IDs
      const { data: existingDist } = await supabaseAdmin
        .from('user_distributed_profiles')
        .select('profile_id')
        .eq('user_id', uid);

      const excludeIds = new Set((existingDist || []).map(d => d.profile_id));
      excludeIds.add(uid);

      const excludeArray = Array.from(excludeIds);
      let query = supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('gender', oppositeGender)
        .order('created_at', { ascending: false })
        .limit(count || 10);

      if (excludeArray.length > 0) {
        query = query.not('user_id', 'in', `(${excludeArray.join(',')})`);
      }

      const { data: profiles } = await query;

      if (profiles && profiles.length > 0) {
        const now = new Date().toISOString();
        const rows = [];

        profiles.forEach(p => {
          if (section === 'both' || section === 'all_matches') {
            rows.push({
              user_id: uid,
              profile_id: p.user_id,
              section: 'all_matches',
              distributed_at: now,
              is_new: true,
            });
          }
          if (section === 'both' || section === 'daily_updates') {
            rows.push({
              user_id: uid,
              profile_id: p.user_id,
              section: 'daily_updates',
              distributed_at: now,
              is_new: true,
            });
          }
        });

        if (rows.length > 0) {
          await supabaseAdmin.from('user_distributed_profiles').insert(rows);
          await supabaseAdmin.from('distribution_logs').insert({
            user_id: uid,
            tier: tier || 'unknown',
            distribution_type: 'manual',
            section: section,
            profiles_added: profiles.length,
            distributed_at: now,
          });
          totalDistributed += profiles.length;
        }
      }
    } catch (err) {
      logger.error(`Manual distribution failed for user ${uid}:`, err.message);
    }
  }

  return { distributed: totalDistributed, users: userIds.length };
}

export default { runInitialDistribution, runDailyDistribution, manualDistribution };
