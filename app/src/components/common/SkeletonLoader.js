/**
 * Wedring Matrimony — Skeleton Loader Component
 * High-performance animated placeholder for loading states using Reanimated
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadiusValue = borderRadius.sm,
  style,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        // Sweep from -SCREEN_WIDTH to SCREEN_WIDTH
        { translateX: -SCREEN_WIDTH + progress.value * SCREEN_WIDTH * 2 },
      ],
    };
  });

  return (
    <View
      style={[
        styles.skeletonBase,
        { width, height, borderRadius: borderRadiusValue },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[
          'rgba(255, 255, 255, 0)',
          'rgba(255, 255, 255, 0.5)',
          'rgba(255, 255, 255, 0)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { width: SCREEN_WIDTH }, animatedStyle]}
      />
    </View>
  );
};

/**
 * Profile Card Skeleton (Matches Screen Full-screen Card)
 */
export const ProfileCardSkeleton = () => (
  <View style={[skeletonStyles.profileCard, { height: '100%', width: '100%' }]}>
    <SkeletonLoader height="100%" borderRadiusValue={borderRadius['2xl']} />
    <View style={skeletonStyles.profileCardOverlay}>
      <SkeletonLoader width="60%" height={32} borderRadiusValue={borderRadius.sm} />
      <SkeletonLoader width="40%" height={20} style={{ marginTop: 12 }} borderRadiusValue={borderRadius.sm} />
      <SkeletonLoader width="80%" height={20} style={{ marginTop: 12 }} borderRadiusValue={borderRadius.sm} />
      <View style={skeletonStyles.profileTags}>
        <SkeletonLoader width={80} height={32} borderRadiusValue={16} />
        <SkeletonLoader width={100} height={32} borderRadiusValue={16} style={{ marginLeft: 8 }} />
      </View>
    </View>
  </View>
);

/**
 * Home Feed Skeleton (Recommended / Daily Matches Horizontal List)
 */
export const HomeFeedSkeleton = () => (
  <View style={skeletonStyles.homeFeedContainer}>
    <View style={skeletonStyles.homeFeedHeader}>
      <SkeletonLoader width={150} height={24} />
      <SkeletonLoader width={60} height={20} />
    </View>
    <View style={skeletonStyles.homeFeedList}>
      {[1, 2, 3].map((key) => (
        <View key={key} style={skeletonStyles.homeFeedItem}>
          <SkeletonLoader width={140} height={180} borderRadiusValue={borderRadius.lg} />
          <SkeletonLoader width={100} height={16} style={{ marginTop: 12 }} />
          <SkeletonLoader width={80} height={12} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  </View>
);

/**
 * Chat List Item Skeleton
 */
export const ChatItemSkeleton = () => (
  <View style={skeletonStyles.chatItem}>
    <SkeletonLoader width={56} height={56} borderRadiusValue={28} />
    <View style={skeletonStyles.chatInfo}>
      <View style={skeletonStyles.chatHeader}>
        <SkeletonLoader width="50%" height={18} />
        <SkeletonLoader width={40} height={14} />
      </View>
      <SkeletonLoader width="70%" height={14} style={{ marginTop: 8 }} />
    </View>
  </View>
);

/**
 * Notification Skeleton
 */
export const NotificationSkeleton = () => (
  <View style={skeletonStyles.notificationItem}>
    <SkeletonLoader width={48} height={48} borderRadiusValue={24} />
    <View style={skeletonStyles.notificationInfo}>
      <SkeletonLoader width="90%" height={16} />
      <SkeletonLoader width="60%" height={14} style={{ marginTop: 8 }} />
      <SkeletonLoader width={60} height={12} style={{ marginTop: 12 }} />
    </View>
  </View>
);

/**
 * Profile Detail Skeleton
 */
export const ProfileDetailSkeleton = () => (
  <View style={skeletonStyles.profileDetail}>
    <SkeletonLoader height={350} borderRadiusValue={0} />
    <View style={skeletonStyles.detailContent}>
      <SkeletonLoader width="70%" height={28} />
      <SkeletonLoader width="50%" height={18} style={{ marginTop: 12 }} />
      <SkeletonLoader width="100%" height={1} style={{ marginVertical: 24 }} />
      <SkeletonLoader width="40%" height={20} />
      <View style={skeletonStyles.gridContainer}>
        {[1, 2, 3, 4].map((key) => (
          <SkeletonLoader key={key} width="48%" height={60} style={{ marginBottom: 12 }} borderRadiusValue={borderRadius.md} />
        ))}
      </View>
      <SkeletonLoader width="40%" height={20} style={{ marginTop: 24 }} />
      <SkeletonLoader width="100%" height={120} style={{ marginTop: 16 }} borderRadiusValue={borderRadius.md} />
    </View>
  </View>
);

/**
 * My Profile Skeleton — mirrors the own-profile screen layout
 * (hero avatar + completion ring, quick stats, grouped menu rows).
 */
export const MyProfileSkeleton = () => (
  <View style={skeletonStyles.myProfile}>
    {/* Hero */}
    <View style={skeletonStyles.myProfileHero}>
      <SkeletonLoader width={96} height={96} borderRadiusValue={48} />
      <SkeletonLoader width={160} height={24} style={{ marginTop: 16 }} />
      <SkeletonLoader width={100} height={16} style={{ marginTop: 10 }} />
      <View style={skeletonStyles.myProfileBadges}>
        <SkeletonLoader width={84} height={26} borderRadiusValue={borderRadius.full} />
        <SkeletonLoader width={84} height={26} borderRadiusValue={borderRadius.full} style={{ marginLeft: 8 }} />
      </View>
    </View>

    {/* Quick stat cards */}
    <View style={skeletonStyles.myProfileStats}>
      {[1, 2, 3].map((key) => (
        <SkeletonLoader key={key} width="31%" height={76} borderRadiusValue={borderRadius.lg} />
      ))}
    </View>

    {/* Grouped menu rows */}
    <View style={skeletonStyles.myProfileMenu}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={skeletonStyles.myProfileMenuRow}>
          <SkeletonLoader width={40} height={40} borderRadiusValue={borderRadius.md} />
          <View style={skeletonStyles.myProfileMenuText}>
            <SkeletonLoader width="55%" height={16} />
            <SkeletonLoader width="35%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  </View>
);

/**
 * Premium Plans Skeleton
 */
export const PremiumPlansSkeleton = () => (
  <View style={skeletonStyles.premiumPlansContainer}>
    <SkeletonLoader width="60%" height={28} style={{ alignSelf: 'center', marginBottom: 24 }} />
    <View style={skeletonStyles.premiumCards}>
      {[1, 2].map((key) => (
        <View key={key} style={skeletonStyles.premiumCardItem}>
          <SkeletonLoader width="100%" height={220} borderRadiusValue={borderRadius.xl} />
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: colors.skeleton || '#E5E7EB',
    overflow: 'hidden',
  },
});

const skeletonStyles = StyleSheet.create({
  // Profile Card
  profileCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius['2xl'],
  },
  profileCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 100, // Make room for action buttons
  },
  profileTags: {
    flexDirection: 'row',
    marginTop: 16,
  },
  // Home Feed
  homeFeedContainer: {
    marginVertical: 16,
  },
  homeFeedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  homeFeedList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  homeFeedItem: {
    marginRight: 16,
  },
  // Chat Item
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight || '#F3F4F6',
  },
  notificationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  // Profile Detail
  profileDetail: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailContent: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: colors.background,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  // My Profile
  myProfile: {
    flex: 1,
    backgroundColor: colors.background,
  },
  myProfileHero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 20,
    backgroundColor: colors.sectionBackground,
  },
  myProfileBadges: {
    flexDirection: 'row',
    marginTop: 16,
  },
  myProfileStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  myProfileMenu: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 14,
  },
  myProfileMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
  },
  myProfileMenuText: {
    flex: 1,
    marginLeft: 14,
  },
  // Premium Plans
  premiumPlansContainer: {
    padding: 20,
  },
  premiumCards: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  premiumCardItem: {
    flex: 1,
    maxWidth: 200,
  },
});

export default React.memo(SkeletonLoader);
