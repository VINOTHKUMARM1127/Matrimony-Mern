/**
 * Wedring Matrimony — Premium Home Screen
 * Dynamic feed with multiple content sections: Daily Picks, Recommended,
 * Recently Active, Premium Members, Nearby, Trending, and Upgrade CTA.
 */
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import { HomeFeedSkeleton, ProfileCardSkeleton } from '../../components/common/SkeletonLoader';
import useAuthStore from '../../store/useAuthStore';
import useProfileStore from '../../store/useProfileStore';
import useMatches from '../../hooks/useMatches';
import * as settingsApi from '../../api/settingsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PICK_CARD_WIDTH = 150;
const AVATAR_ROW_SIZE = 64;

const HomeScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const photos = useProfileStore((s) => s.photos);
  const primaryPhoto = photos?.find((p) => p.is_primary)?.storage_path;

  const {
    recommended,
    loadingRecommended,
    dailyMatches,
    loadingDaily,
    nearbyMatches,
    loadingNearby,
    refetchRecommended,
    refetchDaily,
  } = useMatches();

  const { data: quotas, isLoading: loadingQuotas } = useQuery({
    queryKey: ['user_quotas', user?.id],
    queryFn: async () => {
      const balance = await settingsApi.fetchUserLimits(user?.id);
      return balance ? {
        tier: profile?.is_premium ? 'Premium' : 'Free',
        contacts_remaining: balance.contacts_limit,
        interests_remaining: balance.interests_limit,
        other_plans: []
      } : null;
    },
    enabled: !!user?.id,
  });

  // distData removed, we don't need to show distribution unlocked counts unless backend exposes it
  const distData = null;

  const isFreeUser = !profile?.is_premium;

  const getTierDisplay = () => {
    // get_user_quotas returns tier as 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM'.
    if (!quotas || quotas.tier === 'FREE') return 'Free Tier';
    return `${quotas.tier} Premium`;
  };

  // Days remaining until plan expiry (null for free / no expiry).
  const daysRemaining = useMemo(() => {
    if (!quotas?.expires_at) return null;
    const ms = new Date(quotas.expires_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }, [quotas?.expires_at]);

  const firstName = profile?.name?.split(' ')[0] || 'User';

  // Derive "Recently Active" from recommended (sorted by last_active_at)
  const recentlyActive = useMemo(() => {
    if (!recommended) return [];
    return [...recommended]
      .filter((p) => p.last_active_at)
      .sort((a, b) => new Date(b.last_active_at) - new Date(a.last_active_at))
      .slice(0, 12);
  }, [recommended]);

  // Derive "Premium Members" from recommended
  const premiumMembers = useMemo(() => {
    if (!recommended) return [];
    return recommended.filter((p) => p.is_premium).slice(0, 8);
  }, [recommended]);

  const handleProfilePress = useCallback(
    (prof) => {
      navigation.navigate('UserProfile', { profileId: prof.id });
    },
    [navigation]
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchRecommended(), refetchDaily()]);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const getPrimaryPhoto = (prof) => {
    if (!prof?.photos?.length) return null;
    const primary = prof.photos.find((p) => p.is_primary);
    return (primary || prof.photos[0])?.storage_path;
  };

  const isRecentlyOnline = (lastActive) => {
    if (!lastActive) return false;
    return Date.now() - new Date(lastActive).getTime() < 30 * 60 * 1000;
  };

  // ──────────────── SECTION RENDERERS ────────────────

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Avatar source={primaryPhoto} name={profile?.name || ''} size={48} />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={styles.greetingText}>Hello, {firstName}</Text>
          <Text style={styles.greetingSubtext}>Find your perfect match today</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="settings" size={20} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell" size={20} color={colors.textPrimary} strokeWidth={2} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileDashboard = () => (
    <View style={styles.profileDashboard}>
      <View style={styles.profileDashboardCard}>
        <View style={styles.dashboardHeader}>
          <View style={styles.dashboardAvatarWrapper}>
            <Avatar
              source={primaryPhoto}
              name={profile?.name || ''}
              size={56}
              showVerified={profile?.is_verified}
            />
          </View>
          <View style={styles.dashboardInfo}>
            <Text style={styles.dashboardName}>
              {profile?.name || 'Your Name'}
            </Text>
            <Text style={styles.dashboardSubtext}>
              {getTierDisplay()}
            </Text>
            {quotas?.expires_at && !isFreeUser && (
              <Text style={styles.dashboardExpiry}>
                Expires {new Date(quotas.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {daysRemaining != null ? `  ·  ${daysRemaining} days left` : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Quotas Section */}
        {loadingQuotas && !quotas ? (
          <View style={styles.quotasContainer}>
            <View style={styles.quotaRow}>
              <View style={styles.quotaItem}>
                <View style={styles.quotaSkeleton} />
                <Text style={styles.quotaLabel}>Contacts Left</Text>
              </View>
              <View style={styles.quotaDivider} />
              <View style={styles.quotaItem}>
                <View style={styles.quotaSkeleton} />
                <Text style={styles.quotaLabel}>Interests Left</Text>
              </View>
            </View>
          </View>
        ) : quotas && (
          <View style={styles.quotasContainer}>
            <View style={styles.quotaRow}>
              <View style={styles.quotaItem}>
                <Text style={styles.quotaValue}>
                  {quotas.contacts_remaining === -1 ? '∞' : quotas.contacts_remaining}
                </Text>
                <Text style={styles.quotaLabel}>
                  Contacts Left
                </Text>
              </View>
              <View style={styles.quotaDivider} />
              <View style={styles.quotaItem}>
                <Text style={styles.quotaValue}>
                  {quotas.interests_remaining === -1 ? '∞' : quotas.interests_remaining}
                </Text>
                <Text style={styles.quotaLabel}>
                  Interests Left
                </Text>
              </View>
            </View>

            {distData && (
              <View style={{ marginBottom: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  You have access to <Text style={{ fontWeight: 'bold', color: colors.primary }}>{distData.total_recommended_unlocked}</Text> matches 
                  and <Text style={{ fontWeight: 'bold', color: colors.primary }}>{distData.total_nearby_unlocked}</Text> nearby profiles.
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.dashboardActionBtn}
              onPress={() => navigation.navigate('Premium')}
            >
              <Text style={styles.dashboardActionText}>{isFreeUser ? 'Upgrade Plan' : 'Recharge Plan'}</Text>
            </TouchableOpacity>

            {/* Other active plans (priority system: current = highest tier) */}
            {Array.isArray(quotas.other_plans) && quotas.other_plans.length > 0 && (
              <View style={styles.otherPlansContainer}>
                <Text style={styles.otherPlansTitle}>Other Active Plans</Text>
                {quotas.other_plans.map((op, idx) => (
                  <View key={`${op.plan}-${idx}`} style={styles.otherPlanRow}>
                    <Text style={styles.otherPlanName}>{op.label || op.plan}</Text>
                    <Text style={styles.otherPlanDays}>
                      {op.status === 'paused' 
                        ? `${op.remaining_days || 0} days banked` 
                        : `${op.duration_months || 0} months pending`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );



  const renderUpgradeBanner = () => {
    if (!isFreeUser) return null;

    return (
      <TouchableOpacity
        style={styles.upgradeBanner}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('UpgradesTab')}
      >
        <LinearGradient
          colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upgradeGradient}
        >
          <View style={styles.upgradeIconWrap}>
            <Icon name="crown" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.upgradeContent}>
            <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
            <Text style={styles.upgradeSubtext}>
              View contact numbers, access horoscopes, and connect instantly
            </Text>
          </View>
          <View style={styles.upgradeArrow}>
            <Icon name="chevronRight" size={18} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // ──────────────── MAIN RENDER ────────────────

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {renderHeader()}
        {renderProfileDashboard()}
        {renderUpgradeBanner()}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ──────────────── STYLES ────────────────

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header ──
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  headerTextBlock: {
    flex: 1,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  greetingSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberBadge: {
    backgroundColor: colors.goldSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldDark,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.surfacePressed,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cardSoft,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surfacePressed,
  },

  // ── Profile Dashboard ──
  profileDashboard: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: 12,
  },
  profileDashboardCard: {
    borderRadius: borderRadius.xl,
    padding: 20,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  dashboardAvatarWrapper: {
    position: 'relative',
  },
  dashboardUpdatePhotoBtn: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  dashboardUpdatePhotoIcon: {
    fontSize: 14,
  },
  dashboardName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  dashboardSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dashboardExpiry: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  quotasContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  quotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  quotaItem: {
    flex: 1,
    alignItems: 'center',
  },
  quotaValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  quotaSkeleton: {
    width: 36,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
    opacity: 0.6,
  },
  quotaLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  quotaDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.borderLight,
  },
  dashboardActionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  dashboardActionText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  otherPlansContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  otherPlansTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  otherPlanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  otherPlanName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  otherPlanDays: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Section Shared ──
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  horizontalList: {
    gap: layout.horizontalListGap,
    paddingRight: layout.screenPaddingHorizontal,
  },

  // ── Daily Picks Cards ──
  pickCard: {
    width: PICK_CARD_WIDTH,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  pickImageContainer: {
    height: 190,
    position: 'relative',
  },
  pickImage: {
    width: '100%',
    height: '100%',
  },
  pickNoPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySurface,
  },
  pickNoPhotoText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.4,
  },
  pickGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  pickScoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  pickScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textInverse,
  },
  pickInfo: {
    padding: 10,
  },
  pickName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pickDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Recently Active Avatars ──
  activeAvatarContainer: {
    alignItems: 'center',
    width: 72,
  },
  activeAvatarRing: {
    width: AVATAR_ROW_SIZE,
    height: AVATAR_ROW_SIZE,
    borderRadius: AVATAR_ROW_SIZE / 2,
    borderWidth: 2.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeAvatarOnline: {
    borderColor: colors.online,
  },
  onlinePulse: {
    position: 'absolute',
    top: 0,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.background,
  },
  activeAvatarName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Recommended Feed Cards ──
  feedCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    marginBottom: layout.cardGap,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardSoft,
  },
  feedCardTop: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
  },
  feedCardImage: {
    width: 90,
    height: 110,
    borderRadius: borderRadius.md,
  },
  feedNoPhoto: {
    width: 90,
    height: 110,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedNoPhotoInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.3,
  },
  feedCardDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  feedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  verifiedDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.verified,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedDotText: {
    fontSize: 10,
    color: colors.textInverse,
    fontWeight: '700',
  },
  feedSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  feedAbout: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 4,
  },
  feedCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  feedTags: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  feedTag: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  feedTagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  feedScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  feedScoreValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  feedScoreLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
  },
  feedActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  feedActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  feedActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
  },
  feedActionOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.shortlistGold,
  },
  feedActionOutlineText: {
    color: colors.shortlistGold,
  },

  // ── Premium Members Cards ──
  premiumCard: {
    width: PICK_CARD_WIDTH,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardBackground,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
    ...shadows.cardSoft,
  },
  premiumImageContainer: {
    height: 170,
    position: 'relative',
  },
  premiumImage: {
    width: '100%',
    height: '100%',
  },
  premiumNoPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldSurface,
  },
  premiumInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.gold,
    opacity: 0.4,
  },
  premiumBadgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadgeIcon: {
    fontSize: 13,
    color: colors.textInverse,
    fontWeight: '700',
  },
  premiumInfo: {
    padding: 10,
  },
  premiumName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  premiumDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Nearby Matches Grid ──
  nearbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nearbyCard: {
    width: (SCREEN_WIDTH - layout.screenPaddingHorizontal * 2 - 24) / 3,
    alignItems: 'center',
  },
  nearbyImage: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: borderRadius.md,
  },
  nearbyNoPhoto: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.3,
  },
  nearbyName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  nearbyOcc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // ── Upgrade Banner ──
  upgradeBanner: {
    marginTop: 24,
    marginHorizontal: layout.screenPaddingHorizontal,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.cardFloat,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  upgradeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textInverse,
  },
  upgradeSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    lineHeight: 17,
  },
  upgradeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;
