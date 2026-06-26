/**
 * Wedring Backend — Admin Bulk Import Service
 *
 * Parse CSV/JSON uploads, validate each row, create users in Supabase.
 */
import { supabaseAdmin } from '../../../config/supabase.js';
import { parse } from 'csv-parse/sync';
import logger from '../../../utils/logger.js';

/**
 * Import users from CSV or JSON file buffer
 */
export async function importUsers(fileBuffer, mimetype, originalname) {
  let users = [];

  // Parse based on file type
  if (mimetype === 'application/json' || originalname?.endsWith('.json')) {
    users = JSON.parse(fileBuffer.toString('utf-8'));
    if (!Array.isArray(users)) users = [users];
  } else {
    // CSV
    const csvString = fileBuffer.toString('utf-8');
    users = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }

  if (users.length === 0) {
    return { success_count: 0, failed_rows: [{ row: 0, error: 'Empty file' }] };
  }

  // Validate all rows first
  const errors = [];
  users.forEach((user, i) => {
    if (!user.email) errors.push({ row: i + 1, error: 'Missing email' });
    if (!user.password && !user.phone) errors.push({ row: i + 1, error: 'Missing password or phone' });
  });

  if (errors.length > 0) {
    return { success_count: 0, failed_rows: errors, message: 'Validation failed — no records imported' };
  }

  // Import each user
  const results = { success_count: 0, failed_rows: [] };

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password || 'Wedring@123',
        email_confirm: true,
      });

      if (authErr) throw new Error(authErr.message);

      const userId = authData.user.id;

      // 2. Create users table record
      await supabaseAdmin.from('users').upsert({
        id: userId,
        email: user.email,
        mobile: user.mobile || user.phone || null,
        profile_for: user.profile_for || 'myself',
        mother_tongue: user.mother_tongue || null,
        membership_tier: user.membership_tier || 'free',
        is_active: true,
      }, { onConflict: 'id' });

      // 3. Create profile
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        user_id: userId,
        full_name: user.full_name || user.name || null,
        gender: user.gender || null,
        dob: user.dob || user.date_of_birth || null,
        height_cm: parseInt(user.height_cm) || null,
        marital_status: user.marital_status || null,
        religion: user.religion || null,
        caste: user.caste || null,
        highest_qualification: user.highest_qualification || user.education || null,
        occupation: user.occupation || null,
        annual_income: user.annual_income || null,
        state: user.state || null,
        district: user.district || null,
        city: user.city || null,
        about_me: user.about_me || null,
      }, { onConflict: 'user_id' });

      results.success_count++;
    } catch (err) {
      results.failed_rows.push({ row: i + 1, email: user.email, error: err.message });
    }
  }

  logger.info(`Bulk import: ${results.success_count} success, ${results.failed_rows.length} failed`);
  return results;
}

export default { importUsers };
