/**
 * Wedring Matrimony — ProfileHeader Component
 * Premium profile header displaying user identification details and core metadata
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import VerificationBadge from './VerificationBadge';
import Badge from '../common/Badge';

const ProfileHeader = ({ profile }) => {
  if (!profile) return null;

  const age = (() => {
    if (!profile.date_of_birth) return '';
    const dob = new Date(profile.date_of_birth);
    const today = new Date();
    let a = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
    return a;
  })();

  const heightDisplay = (() => {
    if (!profile.height_cm) return '';
    const feet = Math.floor(profile.height_cm / 30.48);
    const inches = Math.round((profile.height_cm / 2.54) % 12);
    return `${feet}'${inches}" (${profile.height_cm} cm)`;
  })();

  return (
    <View style={styles.container}>
      {/* Title block with Verification */}
      <View style={styles.titleRow}>
        <Text style={styles.name} numberOfLines={2}>
          {profile.display_name}
        </Text>
        {profile.is_verified && (
          <View style={styles.badgeWrapper}>
            <VerificationBadge showText={false} size="medium" />
          </View>
        )}
      </View>

      {/* ID Code */}
      <Text style={styles.profileId}>
        ID: {profile.profile_id || `TM-${profile.id?.substring(0, 8).toUpperCase()}`}
      </Text>

      {/* Badges Row */}
      <View style={styles.badgesRow}>
        {profile.is_premium && (
          <Badge label="👑 Premium Member" variant="premium" size="medium" />
        )}
        <Badge 
          label={profile.marital_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Never Married'} 
          variant="outline" 
          size="medium" 
        />
        <Badge 
          label={profile.mother_tongue || 'Tamil'} 
          variant="outline" 
          size="medium" 
        />
      </View>

      {/* Core info items */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Age / Height</Text>
          <Text style={styles.infoValue}>{age} yrs • {heightDisplay || 'N/A'}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Religion / Caste</Text>
          <Text style={styles.infoValue}>
            {profile.religion}{profile.caste ? ` • ${profile.caste}` : ''}
          </Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Profession</Text>
          <Text style={styles.infoValue}>{profile.occupation || 'Not Specified'}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>
            📍 {profile.city || profile.district || 'Tamil Nadu'}, {profile.state || 'India'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  badgeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileId: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: borderRadius.lg,
  },
  infoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
});

export default ProfileHeader;
