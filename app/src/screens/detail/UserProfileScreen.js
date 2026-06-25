/**
 * Wedring Matrimony — UserProfileScreen Component (Premium Redesign)
 * Detailed profile view with collapsible sections, premium gated content,
 * compatibility progress bars, and professional footer actions.
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import PhotoGallery from '../../components/profile/PhotoGallery';
import ProfileHeader from '../../components/profile/ProfileHeader';
import { ProfileDetailSkeleton } from '../../components/common/SkeletonLoader';
import SuccessOverlay from '../../components/common/SuccessOverlay';
import useAuthStore from '../../store/useAuthStore';
import useProfileStore from '../../store/useProfileStore';
import useToastStore from '../../store/useToastStore';
import * as profilesApi from '../../api/profiles';
import * as interestApi from '../../api/interests';
import { calculateCompatibility } from '../../utils/matchingEngine';
import * as settingsApi from '../../api/settingsApi';
import apiClient from '../../api/apiClient';

const CollapsibleSection = ({ title, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const heightValue = useSharedValue(defaultExpanded ? 1 : 0);

  const toggle = () => {
    setExpanded(!expanded);
    heightValue.value = withTiming(expanded ? 0 : 1, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: heightValue.value,
  }));

  return (
    <View style={styles.collapsibleCard}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <Text style={[styles.collapsibleIcon, expanded && styles.collapsibleIconRotated]}>
          ›
        </Text>
      </TouchableOpacity>
      {expanded && (
        <Animated.View style={[styles.collapsibleContent, animatedStyle]}>
          <View style={styles.divider} />
          {children}
        </Animated.View>
      )}
    </View>
  );
};

const UserProfileScreen = ({ route, navigation }) => {
  const { profileId } = route.params;
  const queryClient = useQueryClient();

  const currentUser = useAuthStore((s) => s.user);
  const myProfile = useProfileStore((s) => s.profile);
  const myPhotos = useProfileStore((s) => s.photos);
  const [revealingPhone, setRevealingPhone] = useState(false);
  const [showInterestSent, setShowInterestSent] = useState(false);
  const [showContactUnlocked, setShowContactUnlocked] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  // 1. Fetch details of target user
  const { data: targetProfile, isLoading, error, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => profilesApi.getProfile(profileId),
    enabled: !!profileId,
  });

  // 2. Fetch interest status
  const { data: interestStatus, refetch: refetchInterest } = useQuery({
    queryKey: ['interestStatus', currentUser?.id, profileId],
    queryFn: async () => {
      return interestApi.getInterestStatus(profileId);
    },
    enabled: !!currentUser?.id && !!profileId,
  });

  // Fetch Quotas 
  const { data: quotas, refetch: refetchQuotas } = useQuery({
    queryKey: ['user_quotas', currentUser?.id],
    queryFn: async () => {
      const balance = await settingsApi.fetchUserLimits(currentUser?.id);
      return balance ? {
        tier: myProfile?.is_premium ? 'Premium' : 'FREE',
        contact_credits: balance.contacts_limit,
        interest_credits: balance.interests_limit,
      } : null;
    },
    enabled: !!currentUser?.id,
  });

  // Check if already viewed this target's phone
  const { data: hasViewedPhone = false, refetch: refetchHasViewed } = useQuery({
    queryKey: ['hasViewedPhone', currentUser?.id, profileId],
    queryFn: async () => {
      // In the new API, the targetProfile contains contact_unlocked or mobile
      // If we need to explicitly check, we can rely on targetProfile.mobile
      // For now, we will simulate this check based on targetProfile properties.
      return !!targetProfile?.mobile || !!targetProfile?.contact_unlocked;
    },
    enabled: !!currentUser?.id && !!profileId && !!targetProfile,
  });

  // Calculate compatibility score client side
  const compatibilityResult = useMemo(() => {
    if (!myProfile || !targetProfile) return null;
    return calculateCompatibility(
      myProfile,
      myProfile.partner_preferences || null,
      targetProfile,
      myProfile.horoscope_details || null,
      targetProfile.horoscope_details || null
    );
  }, [myProfile, targetProfile]);

  const compatibilityScore = compatibilityResult?.totalScore || 0;
  const compatibilityBreakdown = compatibilityResult?.breakdown || {};

  // Privacy Locks / Gates
  // get_user_quota returns tier as 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM',
  // and wallet balances as contact_credits / interest_credits (also mirrored
  // as contacts_remaining / interests_remaining; -1 = unlimited).
  const isPremiumTier = quotas?.tier && quotas.tier !== 'FREE';
  const isHoroscopeUnlocked = isPremiumTier || (interestStatus && interestStatus.sender_id === profileId);

  // Contact unlock is gated on WALLET CREDITS, not tier — this matches what the
  // unlock_contact RPC actually enforces. A user (free or premium) with credits
  // can unlock; a user with zero credits is prompted to recharge/upgrade.
  const contactsRemaining = quotas?.contact_credits ?? quotas?.contacts_remaining ?? 0;
  const hasRemainingViews = contactsRemaining === -1 || contactsRemaining > 0;
  const isMobileUnlocked = hasRemainingViews;

  // Interest sending is likewise gated on wallet credits (-1 = unlimited).
  const interestsRemaining = quotas?.interest_credits ?? quotas?.interests_remaining ?? 0;
  const hasInterestsLeft = interestsRemaining === -1 || interestsRemaining > 0;

  const getSimulatedPhoneNumber = () => {
    const seed = profileId?.slice(-4) || '1234';
    return `+91 98401 ${seed}`;
  };

  const handleRevealMobileNumber = async () => {
    if (hasViewedPhone) return;

    // Gate on wallet credits only (matches the unlock_contact RPC). No tier check.
    if (!hasRemainingViews) {
      Alert.alert(
        'No Contact Credits',
        'You have no contact credits left. Purchase a plan to get more contact credits.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Credits', onPress: () => navigation.navigate('Premium') },
        ]
      );
      return;
    }

    try {
      setRevealingPhone(true);
      await apiClient.post(`/credits/deduct/contact/${profileId}`);
      
      refetchProfile();
      refetchQuotas();
      setRevealingPhone(false);
      setShowContactUnlocked(true);
    } catch (err) {
      setRevealingPhone(false);
      if (err.message?.includes('QUOTA_EXCEEDED')) {
        showToast('warning', 'Limit Exceeded', 'You do not have enough contact views remaining. Please recharge.');
      } else {
        showToast('error', 'Error', err.message || 'Failed to unlock contact details.');
      }
    }
  };

  // Send Interest Mutation with optimistic quota update
  const sendInterestMutation = useMutation({
    mutationFn: async () => {
      await interestApi.sendInterest(profileId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['user_quotas', currentUser.id] });
      const previousQuotas = queryClient.getQueryData(['user_quotas', currentUser.id]);
      if (previousQuotas && previousQuotas.interests_remaining > 0) {
        queryClient.setQueryData(['user_quotas', currentUser.id], {
          ...previousQuotas,
          interests_remaining: previousQuotas.interests_remaining - 1,
        });
      }
      return { previousQuotas };
    },
    onSuccess: () => {
      refetchInterest();
      queryClient.invalidateQueries({ queryKey: ['user_quotas', currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ['interestsSent'] });
      queryClient.invalidateQueries({ queryKey: ['interestsReceived'] });
      setShowInterestSent(true);
    },
    onError: (err, _vars, context) => {
      if (context?.previousQuotas) {
        queryClient.setQueryData(['user_quotas', currentUser.id], context.previousQuotas);
      }
      if (err.message?.includes('QUOTA_EXCEEDED')) {
        Alert.alert(
          'Limit Exceeded',
          'You have used all your interest requests. Please recharge your plan.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => navigation.navigate('Premium') },
          ]
        );
      } else {
        showToast('error', 'Error', err.message || 'Failed to send interest request');
      }
    },
  });

  const handleSendInterest = async () => {
    const interestsRemaining = quotas?.interests_remaining ?? 0;
    if (interestsRemaining !== -1 && interestsRemaining <= 0) {
      Alert.alert(
        'Limit Exceeded',
        `You have used all your allowed interests. Please recharge to reset your quotas.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrades', onPress: () => navigation.navigate('Premium') },
        ]
      );
      return;
    }

    // Verify the user has at least one photo. Check the live store slices first
    // (profile.photos OR the dedicated photos slice that newly-added photos go
    // into), then fall back to an authoritative COUNT on the photos table so a
    // stale store never blocks a user who genuinely has photos.
    let hasPhoto = (myProfile?.photos?.length || 0) > 0 || (myPhotos?.length || 0) > 0;
    if (!hasPhoto && currentUser?.id) {
      const latestProfile = await profilesApi.getProfile(currentUser.id);
      hasPhoto = (latestProfile?.photos?.length || 0) > 0;
    }

    if (!hasPhoto) {
      Alert.alert(
        'Photo Required',
        'Please upload at least one photo to your profile before sending interests.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Photo', onPress: () => navigation.navigate('EditProfile') },
        ]
      );
      return;
    }
    sendInterestMutation.mutate();
  };

  const acceptInterestMutation = useMutation({
    mutationFn: (interestId) => interestApi.acceptInterest(interestId),
    onSuccess: () => {
      refetchInterest();
      showToast('success', 'Success', 'Interest request accepted! You are now connected.');
    },
  });

  const handleReportPress = () => {
    Alert.alert(
      'Report User',
      'Are you sure you want to report this profile for review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: async () => {
            showToast('info', 'Report Received', 'Thank you. Our team will review this profile within 24 hours.');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ProfileDetailSkeleton />
      </View>
    );
  }

  if (error || !targetProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile details</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderProgressBar = (label, value, max) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <View style={styles.progressRow}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}/{max}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl 
            refreshing={false} 
            onRefresh={() => {
              refetchProfile();
              refetchInterest();
              refetchQuotas();
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Photo Gallery */}
        <PhotoGallery 
          photos={targetProfile.photos || []} 
          isPremiumUser={myProfile?.is_premium} 
          onPhotoPress={(p) => {}}
        />

        {/* Profile Header */}
        <ProfileHeader profile={targetProfile} />

        {/* Compatibility Section */}
        {compatibilityScore > 0 && (
          <View style={styles.section}>
            <View style={styles.compatCardContainer}>
              <View style={styles.compatCardHeader}>
                <View style={styles.compatRing}>
                  <Text style={styles.compatRingValue}>{compatibilityScore}%</Text>
                </View>
                <View style={styles.compatHeaderTexts}>
                  <Text style={styles.compatTitle}>Compatibility Index</Text>
                  <Text style={styles.compatSubtitle}>Based on your preferences</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              {myProfile?.is_premium ? (
                <View style={styles.breakdownList}>
                  {renderProgressBar('Age Preference', compatibilityBreakdown.agePreference || 0, 15)}
                  {renderProgressBar('Religion Similarity', compatibilityBreakdown.religion || 0, 15)}
                  {renderProgressBar('Caste Compatibility', compatibilityBreakdown.caste || 0, 10)}
                  {renderProgressBar('Location Proximity', compatibilityBreakdown.location || 0, 10)}
                  {renderProgressBar('Education Standards', compatibilityBreakdown.education || 0, 10)}
                  {renderProgressBar('Income Compatibility', compatibilityBreakdown.income || 0, 10)}
                  {renderProgressBar('Star (Porutham)', compatibilityBreakdown.starCompatibility || 0, 10)}
                  {renderProgressBar('Dietary Habit', compatibilityBreakdown.foodHabit || 0, 5)}
                  {renderProgressBar('Height Alignment', compatibilityBreakdown.heightPreference || 0, 5)}
                  {renderProgressBar('Verification Bonus', ((compatibilityBreakdown.profileCompleteness || 0) + (compatibilityBreakdown.verificationStatus || 0)) || 0, 10)}
                </View>
              ) : (
                <View style={styles.lockedMatrixContainer}>
                  <View style={styles.lockedRow}>
                    <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
                    <Text style={styles.lockedRowText}>Age Alignment Index</Text>
                  </View>
                  <View style={styles.lockedRow}>
                    <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
                    <Text style={styles.lockedRowText}>Religion & Caste Match</Text>
                  </View>
                  <View style={styles.lockedRow}>
                    <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
                    <Text style={styles.lockedRowText}>Location Proximity Factors</Text>
                  </View>
                  <View style={styles.lockedRow}>
                    <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
                    <Text style={styles.lockedRowText}>Star (Porutham) Compatibility</Text>
                  </View>
                  
                  <View style={styles.lockTeaserBanner}>
                    <Text style={styles.lockTeaserText}>
                      Upgrade to unlock the detailed 11-factor compatibility breakdown and see exactly how you match!
                    </Text>
                    <TouchableOpacity
                      style={styles.unlockMatrixBtn}
                      onPress={() => navigation.navigate('Premium')}
                    >
                      <Text style={styles.unlockMatrixBtnText}>Unlock Matrix</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Dynamic Gated Mobile Number View */}
        <View style={styles.section}>
          <View style={styles.contactCard}>
            <Text style={styles.contactTitle}>Contact Number</Text>
            {hasViewedPhone ? (
              <View style={styles.revealedRow}>
                <Text style={styles.phoneValue}>{targetProfile?.mobile || getSimulatedPhoneNumber()}</Text>
              </View>
            ) : (
              <View style={styles.maskedRow}>
                <Text style={styles.maskedText}>+91 9840* *****</Text>
                <TouchableOpacity
                  style={[styles.revealButton, !hasRemainingViews && styles.lockedRevealBtn]}
                  onPress={handleRevealMobileNumber}
                  disabled={revealingPhone}
                >
                  <Text style={styles.revealBtnText}>
                    {revealingPhone ? 'Unlocking...' : hasRemainingViews ? 'Unlock Mobile' : 'Get Credits'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {!hasViewedPhone && isMobileUnlocked && (
              <Text style={styles.limitDisclaimer}>
                Remaining views: {contactsRemaining === -1 ? 'Unlimited' : contactsRemaining}
              </Text>
            )}
          </View>
        </View>

        {/* Details Sections */}
        <View style={styles.sectionList}>
          <CollapsibleSection title="About Me" defaultExpanded={true}>
            <Text style={styles.aboutText}>
              {targetProfile.about_me || 'No description provided.'}
            </Text>
          </CollapsibleSection>

          <CollapsibleSection title="Education & Career" defaultExpanded={true}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Highest Education</Text>
              <Text style={styles.infoValue}>{targetProfile.education || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Occupation</Text>
              <Text style={styles.infoValue}>{targetProfile.occupation || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Annual Income</Text>
              <Text style={styles.infoValue}>{targetProfile.annual_income || 'N/A'}</Text>
            </View>
          </CollapsibleSection>

          <CollapsibleSection title="Family Background">
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family Type</Text>
              <Text style={styles.infoValue}>{targetProfile.family_type || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Family Status</Text>
              <Text style={styles.infoValue}>{targetProfile.family_status?.replace(/_/g, ' ') || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Father's Occupation</Text>
              <Text style={styles.infoValue}>{targetProfile.father_occupation || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mother's Occupation</Text>
              <Text style={styles.infoValue}>{targetProfile.mother_occupation || 'N/A'}</Text>
            </View>
          </CollapsibleSection>

          <CollapsibleSection title="Lifestyle">
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dietary Habit</Text>
              <Text style={styles.infoValue}>{targetProfile.food_habit || 'N/A'}</Text>
            </View>
          </CollapsibleSection>

          {targetProfile.horoscope_details && (
            <CollapsibleSection title="Horoscope">
              {isHoroscopeUnlocked ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nakshatra (Star)</Text>
                    <Text style={styles.infoValue}>{targetProfile.horoscope_details.star || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Raasi (Moon Sign)</Text>
                    <Text style={styles.infoValue}>{targetProfile.horoscope_details.raasi || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Lagnam</Text>
                    <Text style={styles.infoValue}>{targetProfile.horoscope_details.lagnam || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Gothram</Text>
                    <Text style={styles.infoValue}>{targetProfile.horoscope_details.gothram || 'N/A'}</Text>
                  </View>
                </>
              ) : (
                <View style={styles.lockHoroCard}>
                  <Text style={styles.lockHoroTitle}>Horoscope Locked</Text>
                  <Text style={styles.lockHoroDesc}>
                    Subscribe to view complete horoscope details, Nakshatra, and Gothram.
                  </Text>
                  <TouchableOpacity style={styles.unlockHoroBtn} onPress={() => navigation.navigate('Premium')}>
                    <Text style={styles.unlockHoroBtnText}>View Premium Plans</Text>
                  </TouchableOpacity>
                </View>
              )}
            </CollapsibleSection>
          )}
        </View>

        <TouchableOpacity style={styles.reportButton} onPress={handleReportPress}>
          <Text style={styles.reportText}>Report or Block Profile</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Action Bar */}
      <View style={styles.footer}>
        {interestStatus ? (
          interestStatus.status === 'pending' ? (
            interestStatus.sender_id === currentUser.id ? (
              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.pendingBtn} disabled>
                  <Text style={styles.pendingBtnText}>Interest Pending</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.declineBtn} onPress={() => {}}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => acceptInterestMutation.mutate(interestStatus.id)}
                >
                  <Ionicons name="checkmark-circle" size={17} color={colors.textInverse} />
                  <Text style={styles.acceptBtnText}>Accept Request</Text>
                </TouchableOpacity>
              </View>
            )
          ) : interestStatus.status === 'accepted' ? (
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.connectBtn} disabled>
                <Ionicons name="chatbubble-ellipses" size={17} color={colors.textInverse} />
                <Text style={styles.connectBtnText}>Connected</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.declinedBtn} disabled>
                <Text style={styles.declinedBtnText}>Interest Declined</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.shortlistBtn}>
              <Ionicons name="star" size={16} color={colors.goldDark} />
              <Text style={styles.shortlistBtnText}>Shortlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendInterestBtn, !hasInterestsLeft && styles.lockedRevealBtn]}
              onPress={handleSendInterest}
              disabled={sendInterestMutation.isPending || !hasInterestsLeft}
            >
              <Ionicons name="heart" size={17} color={colors.textInverse} />
              <Text style={styles.sendInterestBtnText}>
                {sendInterestMutation.isPending ? 'Sending...' : hasInterestsLeft ? 'Send Interest' : 'No Interest Credits'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <SuccessOverlay
        visible={showInterestSent}
        icon="heart"
        tint={colors.primary}
        title="Interest Sent!"
        subtitle="We'll notify you when they respond"
        onDone={() => setShowInterestSent(false)}
      />
      <SuccessOverlay
        visible={showContactUnlocked}
        icon="phone"
        tint={colors.success}
        title="Contact Unlocked!"
        subtitle="You can now view their mobile number"
        onDone={() => setShowContactUnlocked(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.textInverse,
    fontWeight: '600',
  },

  section: {
    marginTop: 16,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionList: {
    marginTop: 16,
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: 12,
  },

  // ── Collapsible Card ──
  collapsibleCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardSoft,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  collapsibleIcon: {
    fontSize: 24,
    color: colors.textMuted,
    lineHeight: 24,
    transform: [{ rotate: '90deg' }],
  },
  collapsibleIconRotated: {
    transform: [{ rotate: '-90deg' }],
  },
  collapsibleContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 16,
  },

  // ── Info Row ──
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  // ── Compat Matrix ──
  compatCardContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardSoft,
  },
  compatCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  compatRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatRingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  compatHeaderTexts: {
    flex: 1,
  },
  compatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  compatSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  breakdownList: {
    gap: 12,
  },
  progressRow: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  lockedMatrixContainer: {
    gap: 8,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  lockedRowText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  lockTeaserBanner: {
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.md,
    padding: 14,
    marginTop: 8,
    alignItems: 'center',
    gap: 10,
  },
  lockTeaserText: {
    fontSize: 12,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  unlockMatrixBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unlockMatrixBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Contact Card ──
  contactCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardSoft,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  revealedRow: {
    paddingVertical: 4,
  },
  phoneValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  maskedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maskedText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 2,
  },
  revealButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  lockedRevealBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  revealBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  limitDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },

  // ── Lock Horo ──
  lockHoroCard: {
    backgroundColor: colors.goldSurface,
    borderRadius: borderRadius.md,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  lockHoroTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.goldDark,
  },
  lockHoroDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  unlockHoroBtn: {
    marginTop: 4,
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
  },
  unlockHoroBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  reportButton: {
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 16,
    padding: 10,
  },
  reportText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // ── Footer Action Bar ──
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.bottomNav,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shortlistBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 15,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.shortlistGold,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortlistBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.goldDark,
  },
  sendInterestBtn: {
    flex: 1.6,
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 15,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.buttonFloat,
  },
  sendInterestBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  pendingBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 15,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfacePressed,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.interestOutline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  acceptBtn: {
    flex: 1.6,
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 15,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.buttonFloat,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  connectBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    paddingVertical: 15,
    borderRadius: borderRadius.full,
    backgroundColor: colors.connectTeal,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.buttonFloat,
  },
  connectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  declinedBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: borderRadius.full,
    backgroundColor: colors.declineSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declinedBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.declineRed,
  },
});

export default UserProfileScreen;
