/**
 * Wedring Matrimony — Interests Dashboard (Premium Redesign)
 * Pill-shaped toggle tabs, real profile photos, professional action buttons.
 * Prime gating: Free users see blurred preview cards on Received tab.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { ChatItemSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import useAuthStore from '../../store/useAuthStore';
import useProfileStore from '../../store/useProfileStore';
import * as interestApi from '../../api/interests';
import { createChat } from '../../api/chat';

const InterestsScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const isPremium = useProfileStore((s) => s.profile?.is_premium);
  const [activeSubTab, setActiveSubTab] = useState('received');
  const queryClient = useQueryClient();

  // Fetch Received Interests
  const {
    data: receivedInterests,
    isLoading: loadingReceived,
    refetch: refetchReceived,
  } = useQuery({
    queryKey: ['interestsReceived', user?.id],
    queryFn: () => interestApi.getReceivedInterests(user.id, 'pending'),
    enabled: !!user?.id,
    refetchOnMount: 'always',
  });

  // Fetch Sent Interests
  const {
    data: sentInterests,
    isLoading: loadingSent,
    refetch: refetchSent,
  } = useQuery({
    queryKey: ['interestsSent', user?.id],
    queryFn: () => interestApi.getSentInterests(user.id),
    enabled: !!user?.id,
    refetchOnMount: 'always',
  });

  // Fetch Passed Interests (Not Interested)
  const {
    data: passedInterests,
    isLoading: loadingPassed,
    refetch: refetchPassed,
  } = useQuery({
    queryKey: ['passedInterests', user?.id],
    queryFn: () => interestApi.getPassedProfiles(user.id),
    enabled: !!user?.id,
    refetchOnMount: 'always',
  });

  // Accept Interest
  const acceptMutation = useMutation({
    mutationFn: async ({ interestId, senderId }) => {
      const result = await interestApi.acceptInterest(interestId);
      if (user?.id && senderId) {
        try {
          await createChat(user.id, senderId);
        } catch (err) {
          console.warn('Failed to auto-create chat:', err);
        }
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interestsReceived'] });
      queryClient.invalidateQueries({ queryKey: ['interestsSent'] });
      queryClient.invalidateQueries({ queryKey: ['chatList'] });
    },
  });

  // Decline Interest
  const declineMutation = useMutation({
    mutationFn: (interestId) => interestApi.declineInterest(interestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interestsReceived'] });
    },
  });

  // Express Interest (from Passed tab)
  const interestedMutation = useMutation({
    mutationFn: async (targetUserId) => {
      if (!user?.id) throw new Error('Not logged in');
      return interestApi.sendInterest(user.id, targetUserId);
    },
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ['passedInterests'] });
      const previous = queryClient.getQueryData(['passedInterests', user?.id]);
      
      // Optimistically remove from Passed list
      queryClient.setQueryData(['passedInterests', user?.id], (old) => {
        if (!old) return old;
        return old.filter(item => item.receiver_id !== targetUserId && item.receiver?.id !== targetUserId);
      });
      
      return { previous };
    },
    onError: (err, targetUserId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['passedInterests', user?.id], context.previous);
      }
      console.warn('Failed to send interest from InterestsScreen:', err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_quotas', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['passedInterests'] });
      queryClient.invalidateQueries({ queryKey: ['interestsSent'] });
      queryClient.invalidateQueries({ queryKey: ['userInteractions'] });
    },
  });

  const handleRefresh = useCallback(() => {
    if (activeSubTab === 'received') refetchReceived();
    else if (activeSubTab === 'sent') refetchSent();
    else refetchPassed();
  }, [activeSubTab, refetchReceived, refetchSent, refetchPassed]);

  const handleProfilePress = useCallback(
    (targetUserId) => {
      navigation.navigate('UserProfile', { profileId: targetUserId });
    },
    [navigation]
  );

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birth = new Date(dob);
    return new Date().getFullYear() - birth.getFullYear();
  };

  const getPrimaryPhoto = (prof) => {
    if (!prof?.photos?.length) return null;
    const primary = prof.photos.find((p) => p.is_primary);
    return (primary || prof.photos[0])?.storage_path;
  };

  /** Mask a display name, e.g. "Priya Sharma" → "Pr***" */
  const maskName = (name) => {
    if (!name) return '●●●●●';
    if (name.length <= 2) return name[0] + '***';
    return name.substring(0, 2) + '***';
  };

  // ── Received Item (Premium User — Full Detail) ──
  const renderReceivedItem = ({ item }) => {
    const sender = item.sender;
    if (!sender) return null;
    const age = calculateAge(sender.date_of_birth);
    const photoUri = getPrimaryPhoto(sender);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProfilePress(sender.id)}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          <Avatar source={photoUri} name={sender.display_name || ''} size={64} />
          <View style={styles.cardDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {sender.display_name}{age ? `, ${age}` : ''}
              </Text>
              {sender.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtext} numberOfLines={1}>
              {sender.occupation || 'Professional'} · {sender.education || 'Graduate'}
            </Text>
            <Text style={styles.subtext} numberOfLines={1}>
              {sender.city || 'Tamil Nadu'} · {sender.religion || 'Hindu'}
            </Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => declineMutation.mutate(item.id)}
            disabled={declineMutation.isPending}
          >
            <Text style={styles.declineBtnText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => acceptMutation.mutate({ interestId: item.id, senderId: sender.id })}
            disabled={acceptMutation.isPending}
          >
            <Text style={styles.acceptBtnText}>Accept Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => handleProfilePress(sender.id)}
          >
            <Text style={styles.viewBtnText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Received Item (Free User — Blurred/Masked Preview) ──
  const renderLockedReceivedItem = ({ item, index }) => {
    const sender = item.sender;
    if (!sender) return null;

    return (
      <View style={styles.lockedCard}>
        {/* Masked Content */}
        <View style={styles.cardContent}>
          {/* Blurred avatar placeholder */}
          <View style={styles.lockedAvatarContainer}>
            <View style={styles.lockedAvatar}>
              <Text style={styles.lockedAvatarText}>
                {sender.display_name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.lockedAvatarOverlay} />
          </View>
          <View style={styles.cardDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.lockedName} numberOfLines={1}>
                {maskName(sender.display_name)}
              </Text>
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>🔒</Text>
              </View>
            </View>
            <Text style={styles.lockedSubtext} numberOfLines={1}>
              ●●●●●●● · ●●●●●●
            </Text>
            <Text style={styles.lockedSubtext} numberOfLines={1}>
              ●●●●● · ●●●●
            </Text>
          </View>
        </View>

        {/* Gold Unlock Overlay */}
        <TouchableOpacity
          style={styles.unlockOverlay}
          onPress={() => navigation.navigate('PremiumTab')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#D4A857', '#B8922A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.unlockGradient}
          >
            <Text style={styles.unlockIcon}>👑</Text>
            <Text style={styles.unlockText}>Unlock with Prime</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  // ── Sent Item ──
  const renderSentItem = ({ item }) => {
    const receiver = item.receiver;
    if (!receiver) return null;
    const age = calculateAge(receiver.date_of_birth);
    const photoUri = getPrimaryPhoto(receiver);

    let statusColor = colors.warning;
    let statusLabel = 'Pending';
    let statusBg = colors.warningLight;
    if (item.status === 'accepted') {
      statusColor = colors.success;
      statusLabel = 'Accepted';
      statusBg = colors.successLight;
    } else if (item.status === 'declined') {
      statusColor = colors.error;
      statusLabel = 'Declined';
      statusBg = colors.errorLight;
    } else if (item.status === 'passed') {
      statusColor = colors.textSecondary;
      statusLabel = 'Passed';
      statusBg = colors.surface;
    }

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => handleProfilePress(receiver.id)}
          activeOpacity={0.9}
        >
          <Avatar source={photoUri} name={receiver.display_name || ''} size={64} />
          <View style={styles.cardDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {receiver.display_name}{age ? `, ${age}` : ''}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                <Text style={[styles.statusPillText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>
            <Text style={styles.subtext} numberOfLines={1}>
              {receiver.occupation || 'Professional'} · {receiver.education || 'Graduate'}
            </Text>
            <Text style={styles.subtext} numberOfLines={1}>
              {receiver.city || 'Tamil Nadu'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Button for Passed Tab */}
        {activeSubTab === 'passed' && (
          <View style={styles.passedActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.interestedActionBtn]}
              onPress={() => interestedMutation.mutate(receiver.id)}
              disabled={interestedMutation.isPending}
            >
              <Text style={styles.interestedActionText}>
                {interestedMutation.isPending ? 'Sending...' : 'Interested'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const isLoading = activeSubTab === 'received' ? loadingReceived : activeSubTab === 'sent' ? loadingSent : loadingPassed;
  const listData = activeSubTab === 'received' ? receivedInterests : activeSubTab === 'sent' ? sentInterests : passedInterests;
  const receivedCount = receivedInterests?.length || 0;
  const sentCount = sentInterests?.length || 0;
  const passedCount = passedInterests?.length || 0;

  // ── Skeleton Loading List ──
  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4].map((i) => (
        <ChatItemSkeleton key={i} />
      ))}
    </View>
  );

  // ── Free User Received — Blurred Cards List ──
  const renderLockedReceivedList = () => (
    <ScrollView
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refetchReceived}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Top Banner */}
      <View style={styles.lockBanner}>
        <LinearGradient
          colors={['#FFF8DC', '#FFEFB0']}
          style={styles.lockBannerGradient}
        >
          <Text style={styles.lockBannerIcon}>💕</Text>
          <View style={styles.lockBannerContent}>
            <Text style={styles.lockBannerTitle}>
              {receivedCount} {receivedCount === 1 ? 'person is' : 'people are'} interested in you!
            </Text>
            <Text style={styles.lockBannerDesc}>
              Upgrade to Prime to see who they are and connect instantly
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Blurred Preview Cards */}
      {(receivedInterests || []).map((item, index) => (
        <View key={item.id}>
          {renderLockedReceivedItem({ item, index })}
        </View>
      ))}

      {/* Bottom CTA */}
      <TouchableOpacity
        style={styles.lockBottomCta}
        onPress={() => navigation.navigate('PremiumTab')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#D4A857', '#B8922A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.lockBottomCtaGradient}
        >
          <Text style={styles.lockBottomCtaIcon}>👑</Text>
          <View>
            <Text style={styles.lockBottomCtaTitle}>Upgrade to Prime</Text>
            <Text style={styles.lockBottomCtaDesc}>Unlock all interests & start chatting</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Interests</Text>
      </View>

      {/* Pill Toggle */}
      <View style={styles.pillContainer}>
        <View style={styles.pillTrack}>
          <TouchableOpacity
            style={[styles.pillButton, activeSubTab === 'received' && styles.pillActive]}
            onPress={() => setActiveSubTab('received')}
          >
            <Text style={[styles.pillText, activeSubTab === 'received' && styles.pillTextActive]}>
              Received ({receivedCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pillButton, activeSubTab === 'sent' && styles.pillActive]}
            onPress={() => setActiveSubTab('sent')}
          >
            <Text style={[styles.pillText, activeSubTab === 'sent' && styles.pillTextActive]}>
              Sent ({sentCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pillButton, activeSubTab === 'passed' && styles.pillActive]}
            onPress={() => setActiveSubTab('passed')}
          >
            <Text style={[styles.pillText, activeSubTab === 'passed' && styles.pillTextActive]}>
              Not Interested ({passedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        renderSkeletons()
      ) : activeSubTab === 'received' && !isPremium && receivedCount > 0 ? (
        renderLockedReceivedList()
      ) : (
        <FlatList
          data={listData || []}
          keyExtractor={(item) => item.id}
          renderItem={activeSubTab === 'received' ? renderReceivedItem : renderSentItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              lucideIcon="heart"
              title={activeSubTab === 'received' ? 'No incoming requests' : activeSubTab === 'sent' ? 'No requests sent' : 'No passed profiles'}
              description={
                activeSubTab === 'received'
                  ? 'Profiles that express interest in you will appear here'
                  : activeSubTab === 'sent'
                  ? 'Start sending interests from Matches to connect!'
                  : 'Profiles you pass on will appear here'
              }
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },

  // ── Pill Toggle ──
  pillContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  pillTrack: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    padding: 4,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  pillActive: {
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.textInverse,
  },

  // ── List ──
  list: {
    padding: layout.screenPaddingHorizontal,
    gap: 14,
    paddingBottom: 40,
  },
  skeletonContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: 16,
  },

  // ── Card (Unlocked — Premium Users) ──
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardSoft,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 14,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.verified,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 10,
    color: colors.textInverse,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Action Row ──
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.interestOutline,
    alignItems: 'center',
  },
  declineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  acceptBtn: {
    flex: 1.5,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
  },
  viewBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // ══════════════════════════════════════════
  // ── Locked Card (Free Users — Blurred) ──
  // ══════════════════════════════════════════
  lockedCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  lockedAvatarContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  lockedAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.3,
  },
  lockedSubtext: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  passedActions: {
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  actionBtn: {
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  interestedActionBtn: {
    backgroundColor: colors.primary,
  },
  interestedActionText: {
    fontFamily: typography.semiBold,
    color: colors.surface,
    fontSize: 14,
  },
  lockedAvatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 168, 87, 0.25)',
  },
  lockedName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
    flex: 1,
    letterSpacing: 1,
  },
  lockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadgeText: {
    fontSize: 12,
  },
  lockedSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 2,
    opacity: 0.6,
  },

  // Unlock overlay button inside each locked card
  unlockOverlay: {
    marginTop: 14,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 8,
  },
  unlockIcon: {
    fontSize: 16,
  },
  unlockText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ══════════════════════════════════════
  // ── Lock Banner (Top of Locked List) ──
  // ══════════════════════════════════════
  lockBanner: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
    ...shadows.cardSoft,
  },
  lockBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  lockBannerIcon: {
    fontSize: 36,
  },
  lockBannerContent: {
    flex: 1,
  },
  lockBannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.goldDark,
    marginBottom: 3,
  },
  lockBannerDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },

  // ═══════════════════════════════════
  // ── Bottom CTA (Below Locked Cards) ──
  // ═══════════════════════════════════
  lockBottomCta: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: 6,
    ...shadows.button,
  },
  lockBottomCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 14,
  },
  lockBottomCtaIcon: {
    fontSize: 28,
  },
  lockBottomCtaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lockBottomCtaDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default InterestsScreen;
