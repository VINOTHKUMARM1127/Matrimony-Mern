/**
 * Wedring Matrimony — ProfileCard Component (Premium Redesign)
 * Information-rich feed card with photo, details, tags, and action bar.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - layout.screenPaddingHorizontal * 2;

const ProfileCard = ({ profile, onPress, onInterest, onShortlist, showCompatibility = false, compatibilityScore = 0 }) => {
  const primaryPhoto = useMemo(() => {
    if (!profile?.photos?.length) return null;
    const primary = profile.photos.find((p) => p.is_primary);
    return (primary || profile.photos[0])?.storage_path;
  }, [profile?.photos]);

  const age = useMemo(() => {
    if (!profile?.date_of_birth) return '';
    const dob = new Date(profile.date_of_birth);
    const today = new Date();
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  }, [profile?.date_of_birth]);

  const heightDisplay = useMemo(() => {
    if (!profile?.height_cm) return '';
    const feet = Math.floor(profile.height_cm / 30.48);
    const inches = Math.round((profile.height_cm / 2.54) % 12);
    return `${feet}'${inches}"`;
  }, [profile?.height_cm]);

  if (!profile) return null;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(profile)}
      activeOpacity={0.9}
      style={styles.container}
    >
      {/* Top Section: Photo + Details */}
      <View style={styles.topSection}>
        {/* Photo */}
        <View style={styles.photoContainer}>
          {primaryPhoto ? (
            <Image
              source={{ uri: primaryPhoto }}
              style={styles.image}
              contentFit="cover"
              placeholder="LKO2?U%2Tw=w]~RBVZRi};RPxuwH"
              placeholderContentFit="cover"
              transition={{ effect: 'cross-dissolve', duration: 300 }}
              cachePolicy="memory-disk"
              blurRadius={profile.isLocked ? 15 : 0}
            />
          ) : (
            <View style={styles.noPhoto}>
              <Text style={styles.noPhotoInitial}>
                {profile.display_name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          
          {profile.isLocked && (
            <View style={styles.lockedPhotoOverlay}>
              <Ionicons name="lock-closed" size={24} color="#FFF" style={styles.lockIcon} />
              <Text style={styles.lockedText}>Premium Match</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.isLocked 
                ? `${profile.display_name?.charAt(0)}*****` 
                : profile.display_name}, {age}
            </Text>
            {!profile.isLocked && profile.is_verified && (
              <View style={styles.verifiedDot}>
                <Ionicons name="checkmark" size={10} color="#FFF" style={styles.verifiedIcon} />
              </View>
            )}
          </View>

          <Text style={styles.detailLine} numberOfLines={1}>
            {profile.isLocked ? 'Profession Hidden' : (profile.occupation || 'Professional')} · {profile.isLocked ? 'Location Hidden' : (profile.city || 'Tamil Nadu')}
          </Text>
          <Text style={styles.detailLine} numberOfLines={1}>
            {profile.isLocked ? 'Education Hidden' : (profile.education || 'Graduate')} · {profile.religion || 'Hindu'}
            {!profile.isLocked && profile.caste ? ` · ${profile.caste}` : ''}
          </Text>

          {!profile.isLocked && profile.about_me ? (
            <Text style={styles.aboutSnippet} numberOfLines={2}>
              {profile.about_me}
            </Text>
          ) : null}

          {/* Tags */}
          <View style={styles.tags}>
            {heightDisplay ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{heightDisplay}</Text>
              </View>
            ) : null}
            {profile.marital_status ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {profile.marital_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
              </View>
            ) : null}
            {profile.food_habit ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{profile.food_habit}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Bottom Section: Compatibility + Actions */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomLeft}>
          {/* Online status */}
          {profile.last_active_at && (
            <View style={styles.onlineRow}>
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: isRecentlyActive(profile.last_active_at)
                      ? colors.online
                      : colors.offline,
                  },
                ]}
              />
              <Text style={styles.onlineText}>
                {isRecentlyActive(profile.last_active_at)
                  ? 'Online now'
                  : formatLastActive(profile.last_active_at)}
              </Text>
            </View>
          )}
          {profile.is_premium && (
            <View style={styles.premiumTag}>
              <Text style={styles.premiumTagText}>★ Premium</Text>
            </View>
          )}
        </View>

        {/* Compatibility Score */}
        {showCompatibility && compatibilityScore > 0 && (
          <View style={styles.compatPill}>
            <Text style={styles.compatValue}>{compatibilityScore}%</Text>
            <Text style={styles.compatLabel}>Match</Text>
          </View>
        )}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        {profile.isLocked ? (
          <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.8} onPress={() => {}}>
            <Ionicons name="lock-closed" size={14} color="#FFF" style={styles.btnIcon} />
            <Text style={styles.upgradeBtnText}>Upgrade to View</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onInterest?.(profile)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Interested</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnOutline]}
              onPress={() => onShortlist?.(profile)}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionBtnText, styles.actionBtnOutlineText]}>Shortlist</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const isRecentlyActive = (lastActive) => {
  const diff = Date.now() - new Date(lastActive).getTime();
  return diff < 30 * 60 * 1000;
};

const formatLastActive = (lastActive) => {
  const diff = Date.now() - new Date(lastActive).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `Active ${minutes}m ago`;
  if (hours < 24) return `Active ${hours}h ago`;
  if (days < 7) return `Active ${days}d ago`;
  return 'Active long ago';
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: layout.cardGap,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardSoft,
  },

  // ── Top Section ──
  topSection: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
  },
  photoContainer: {
    width: 95,
    height: 115,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noPhoto: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySurface,
  },
  noPhotoInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.25,
  },
  lockedPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  lockIcon: {
    marginBottom: 4,
  },
  lockedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  details: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  verifiedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  verifiedIcon: {
    marginTop: 0,
  },
  detailLine: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  aboutSnippet: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Bottom Section ──
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  onlineText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  premiumTag: {
    backgroundColor: colors.goldSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  premiumTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.goldDark,
  },
  compatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  compatValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  compatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primary,
  },

  // ── Action Bar ──
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.shortlistGold,
  },
  actionBtnOutlineText: {
    color: colors.shortlistGold,
  },
  upgradeBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.goldDark,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 6,
  },
});

export default React.memo(ProfileCard);
