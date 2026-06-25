/**
 * Wedring Matrimony — Settings Screen (Redesigned)
 * Grouped sections, lucide icons, icon+title+description+chevron rows.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import ScreenHeader from '../../components/common/ScreenHeader';
import Avatar from '../../components/common/Avatar';
import useAuthStore from '../../store/useAuthStore';
import useProfileStore from '../../store/useProfileStore';
import { deactivateProfile } from '../../api/profiles';

const SettingsScreen = ({ navigation }) => {
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useProfileStore((s) => s.profile);
  const photos = useProfileStore((s) => s.photos);
  const primaryPhoto = photos?.find((p) => p.is_primary)?.storage_path || photos?.[0]?.storage_path;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  };

  const handleDeactivate = () => {
    Alert.alert(
      'Got Married / Found a Match?',
      'Congratulations! If you deactivate your profile, it will no longer be visible to others in matches or search.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate', style: 'destructive',
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
          },
        },
      ]
    );
  };

  // Grouped, data-driven sections (icon + title + description + destination).
  const sections = [
    {
      title: 'Account',
      rows: [
        { icon: 'edit', tint: colors.primary, title: 'Edit Profile', desc: 'Photos, basic details, family & more', screen: 'EditProfile' },
        { icon: 'sliders', tint: colors.secondary, title: 'Partner Preferences', desc: 'Age, religion, location & lifestyle', screen: 'EditPreferences' },
      ],
    },
    {
      title: 'Membership',
      rows: [
        { icon: 'crown', tint: colors.gold, title: 'Go Premium', desc: 'Unlock contacts, interests & daily matches', screen: 'Premium' },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        { icon: 'globe', tint: colors.secondary, title: 'Language / மொழி', desc: 'Change app language', screen: 'Language' },
        { icon: 'privacy', tint: colors.primary, title: 'Privacy & Security', desc: 'Control who can see your profile', screen: 'Privacy' },
      ],
    },
    {
      title: 'Support',
      rows: [
        { icon: 'help', tint: colors.textSecondary, title: 'Help & Support', desc: 'Get help or contact us', screen: null },
        { icon: 'document', tint: colors.textSecondary, title: 'Terms of Service', desc: 'Read our terms & policies', screen: null },
      ],
    },
  ];

  const Row = ({ row, isLast }) => (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowDivider]}
      activeOpacity={0.6}
      onPress={() => row.screen && navigation.navigate(row.screen)}
    >
      <View style={[styles.rowIcon, { backgroundColor: row.tint + '15' }]}>
        <Icon name={row.icon} size={20} color={row.tint} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{row.title}</Text>
        {row.desc ? <Text style={styles.rowDesc}>{row.desc}</Text> : null}
      </View>
      <Icon name="chevronRight" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader title="Settings" subtitle="Manage your account & preferences" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile summary card — premium gradient */}
        {profile && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('EditProfile')} style={styles.profileCardWrap}>
            <LinearGradient
              colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCard}
            >
              <View style={styles.profileGlow} />
              <Avatar source={primaryPhoto} name={profile.display_name || ''} size={56} />
              <View style={styles.profileText}>
                <Text style={styles.name} numberOfLines={1}>{profile.display_name || 'Your Name'}</Text>
                <View style={styles.statusChip}>
                  {profile.is_premium && <Icon name="crown" size={12} color="#FFFFFF" />}
                  <Text style={styles.status}>
                    {profile.is_premium ? 'Premium Member' : 'Free Account'}
                  </Text>
                </View>
              </View>
              <View style={styles.profileChevron}>
                <Icon name="chevronRight" size={18} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.rows.map((row, i) => (
                <Row key={row.title} row={row} isLast={i === section.rows.length - 1} />
              ))}
            </View>
          </View>
        ))}

        {/* Danger zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deactivateButton} onPress={handleDeactivate} activeOpacity={0.8}>
            <Icon name="match" size={18} color={colors.textSecondary} />
            <Text style={styles.deactivateText}>Got Married? Deactivate Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Icon name="logout" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0 (Expo SDK 54)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: 32, paddingHorizontal: layout.screenPaddingHorizontal },

  // Profile summary
  profileCardWrap: {
    marginTop: 4,
    marginBottom: 4,
    borderRadius: borderRadius['2xl'],
    ...shadows.cardFloat,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius['2xl'],
    gap: 14,
    overflow: 'hidden',
  },
  profileGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  profileText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  status: { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  profileChevron: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Sections
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 13,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  rowIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowDesc: { fontSize: 12.5, color: colors.textSecondary, marginTop: 2 },

  // Danger zone
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: borderRadius.lg,
  },
  deactivateText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: colors.errorLight,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: borderRadius.lg,
  },
  logoutText: { color: colors.error, fontWeight: '700', fontSize: 14 },
  version: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: 28 },
});

export default SettingsScreen;
