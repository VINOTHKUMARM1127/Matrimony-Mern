/**
 * Wedring Matrimony — My Profile Screen (Premium Redesign)
 * Hero header with avatar, circular completion ring, quick stats,
 * and grouped menu cards. No emojis in chrome.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import Avatar from '../../components/common/Avatar';
import { MyProfileSkeleton } from '../../components/common/SkeletonLoader';
import useAuthStore from '../../store/useAuthStore';
import useProfileStore from '../../store/useProfileStore';
import { uploadProfilePhoto, deactivateProfile } from '../../api/profiles';
import { useQuery } from '@tanstack/react-query';
import * as settingsApi from '../../api/settingsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const profile = useProfileStore((s) => s.profile);
  const photos = useProfileStore((s) => s.photos);
  const isProfileLoading = useProfileStore((s) => s.isLoading);
  const replacePrimaryPhoto = useProfileStore((s) => s.replacePrimaryPhoto);

  const [isUploading, setIsUploading] = React.useState(false);

  // Live quota balances from the single source of truth (get_user_quota,
  // wallet-backed — same source unlock_contact / send_interest deduct from).
  const { data: quotas } = useQuery({
    queryKey: ['user_quotas', user?.id],
    queryFn: async () => {
      const balance = await settingsApi.fetchUserLimits(user?.id);
      return balance ? {
        tier: profile?.is_premium ? 'Premium' : 'FREE',
        contacts_remaining: balance.contacts_limit,
        interests_remaining: balance.interests_limit,
      } : null;
    },
    enabled: !!user?.id,
  });

  const limitInfo = {
    contactsRemaining: quotas?.contacts_remaining ?? 0,
    interestsRemaining: quotas?.interests_remaining ?? 0,
    recommendedUnlocked: quotas?.recommended_limit ?? 0,
    nearbyUnlocked: quotas?.nearby_limit ?? 0,
    dailyUnlocked: quotas?.daily_limit ?? 0,
    isPremium: quotas?.tier && quotas.tier !== 'FREE',
  };

  const primaryPhoto = photos?.find((p) => p.is_primary)?.storage_path;
  const completionPercent = profile?.profile_completion || 0;

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birth = new Date(dob);
    return new Date().getFullYear() - birth.getFullYear();
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photos to upload a profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const fileUri = result.assets[0].uri;
        setIsUploading(true);

        const newPhotoRecord = await uploadProfilePhoto(user.id, fileUri);
        
        if (newPhotoRecord) {
          replacePrimaryPhoto(newPhotoRecord);
        }
        setIsUploading(false);
      }
    } catch (error) {
      setIsUploading(false);
      console.warn('Image upload failed:', error);
      Alert.alert('Upload Failed', 'There was an issue uploading your photo. Please try again.');
    }
  };

  const handleDeactivate = () => {
    Alert.alert(
      'Got Married / Found a Match?',
      'Congratulations! If you deactivate your profile, it will no longer be visible to others in matches or search.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (profile?.id) {
                await deactivateProfile(profile.id);
                Alert.alert('Success', 'Your profile has been deactivated.');
                await signOut();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate profile.');
            }
          }
        }
      ]
    );
  };

  const menuGroups = [
    {
      title: 'Profile Details',
      items: [
        { icon: '✎', label: 'Edit Profile', screen: 'EditProfile' },
        { icon: '♡', label: 'Partner Preferences', screen: 'EditPreferences' },
        { icon: '✦', label: 'Horoscope Details', screen: 'EditProfile', params: { initialTab: 'horoscope' } },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: '★', label: 'Premium Plans', screen: 'Premium' },
        { icon: '⊘', label: 'Notifications', screen: 'Notifications' },
        { icon: '🌐', label: 'Language', screen: 'Language' },
        { icon: '🔒', label: 'Privacy & Security', screen: 'Privacy' },
      ],
    },
  ];

  // ── Circular Progress Ring ──
  const renderCompletionRing = () => {
    const size = 72;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const fillPercent = (completionPercent / 100) * circumference;

    return (
      <View style={styles.ringContainer}>
        <View style={[styles.ringBase, { width: size, height: size, borderRadius: size / 2 }]}>
          <View style={[styles.ringFill, {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.primary,
            borderTopColor: completionPercent >= 25 ? colors.primary : colors.border,
            borderRightColor: completionPercent >= 50 ? colors.primary : colors.border,
            borderBottomColor: completionPercent >= 75 ? colors.primary : colors.border,
            borderLeftColor: completionPercent >= 100 ? colors.primary : colors.border,
          }]} />
          <View style={styles.ringCenter}>
            <Text style={styles.ringPercent}>{completionPercent}%</Text>
          </View>
        </View>
        <Text style={styles.ringLabel}>Complete</Text>
      </View>
    );
  };

  // Show the profile skeleton while the profile is loading for the first time.
  if (isProfileLoading && !profile) {
    return (
      <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
        <MyProfileSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={[colors.sectionBackground, colors.background]}
          style={styles.heroContainer}
        >
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <Avatar
                source={primaryPhoto}
                name={profile?.name || ''}
                size={100}
                showVerified={profile?.is_verified}
              />
              <TouchableOpacity
                style={styles.editAvatarBtn}
                onPress={handleImagePick}
                disabled={isUploading}
              >
                <Text style={styles.editAvatarIcon}>✎</Text>
              </TouchableOpacity>
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color={colors.primary} size="small" />
                </View>
              )}
            </View>
            <Text style={styles.heroName}>
              {profile?.name || 'Your Name'}
              {profile?.date_of_birth ? `, ${calculateAge(profile.date_of_birth)}` : ''}
            </Text>
            <Text style={styles.heroId}>{profile?.profile_id || 'TM000000'}</Text>
            <View style={styles.heroBadges}>
              {profile?.is_premium && (
                <View style={styles.premBadge}>
                  <Text style={styles.premBadgeText}>★ Premium</Text>
                </View>
              )}
              {profile?.is_verified && (
                <View style={styles.verBadge}>
                  <Text style={styles.verBadgeText}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>

          {/* Completion Ring */}
          {renderCompletionRing()}
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Location', value: profile?.city || profile?.district || '—' },
            { label: 'Education', value: profile?.highest_qualification || '—' },
            { label: 'Occupation', value: profile?.occupation || '—' },
            { label: 'Religion', value: profile?.religion || '—' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue} numberOfLines={1}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quota Balances Banner (live from get_user_quota — wallet-backed) */}
        {limitInfo.isPremium && (
          <View style={styles.limitBanner}>
            <View style={styles.limitHeader}>
              <Text style={styles.limitTitle}>Contacts Remaining</Text>
              <Text style={styles.limitValue}>
                {limitInfo.contactsRemaining === -1 ? 'Unlimited' : limitInfo.contactsRemaining}
              </Text>
            </View>
            <View style={[styles.limitHeader, { marginTop: 8 }]}>
              <Text style={styles.limitTitle}>Interests Remaining</Text>
              <Text style={styles.limitValue}>
                {limitInfo.interestsRemaining === -1 ? 'Unlimited' : limitInfo.interestsRemaining}
              </Text>
            </View>
            
            {/* Profile Limits */}
            <View style={{ height: 1, backgroundColor: colors.borderLight, marginVertical: 12 }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase' }}>Profiles Unlocked</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>{limitInfo.recommendedUnlocked}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Recommended</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>{limitInfo.nearbyUnlocked}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Nearby</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>{limitInfo.dailyUnlocked}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>Daily Matches</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Groups */}
        {menuGroups.map((group, gi) => (
          <View key={gi} style={styles.menuGroup}>
            <Text style={styles.menuGroupTitle}>{group.title}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[
                    styles.menuItem,
                    ii < group.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    try { navigation.navigate(item.screen, item.params); } catch (e) {}
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconContainer}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Deactivate Profile */}
        <TouchableOpacity
          style={styles.deactivateButton}
          onPress={handleDeactivate}
          activeOpacity={0.8}
        >
          <Text style={styles.deactivateText}>💍 Got Married? Deactivate Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => signOut()}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Wedring Matrimony v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // ── Hero ──
  heroContainer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  heroContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  editAvatarIcon: {
    fontSize: 14,
    color: colors.textInverse,
    fontWeight: '700',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
  },
  heroId: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  premBadge: {
    backgroundColor: colors.goldSurface,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  premBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.goldDark,
  },
  verBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  verBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },

  // ── Completion Ring ──
  ringContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  ringBase: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringFill: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  ringPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  ringLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },

  // ── Quick Stats ──
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: layout.screenPaddingHorizontal,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginTop: -12,
    ...shadows.cardSoft,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // ── Menu Groups ──
  menuGroup: {
    marginTop: 24,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  menuGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '300',
  },

  // ── Actions ──
  deactivateButton: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: 24,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  deactivateText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.error,
  },
  version: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  
  // ── Limit Banner ──
  limitBanner: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: 20,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  limitTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  limitFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

export default ProfileScreen;
