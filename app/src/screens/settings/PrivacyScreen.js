/**
 * Wedring Matrimony — PrivacyScreen Component
 * Toggle account status and display privacy disclosures
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';

const PrivacyScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [isActive, setIsActive] = useState(profile?.is_active ?? true);

  const handleActiveToggle = async (val) => {
    setIsActive(val);
    try {
      await updateProfile(user.id, { is_active: val });
      Alert.alert(
        'Success',
        val 
          ? 'Your profile is now active and visible to matches.' 
          : 'Your profile has been paused. You will not appear in search results.'
      );
    } catch {
      setIsActive(!val);
      Alert.alert('Error', 'Failed to update profile visibility.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Toggle visibility */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.textCol}>
              <Text style={styles.title}>Profile Active Status</Text>
              <Text style={styles.desc}>
                When inactive, other users cannot view or search your profile.
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleActiveToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isActive ? '#FFFFFF' : '#F4F3F0'}
            />
          </View>
        </View>

        {/* Policy section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy Policy Summary</Text>
          <Text style={styles.policyText}>
            We take your privacy very seriously. Your contact details, including phone number and email address, are encrypted and are only shared with premium members whom you have explicitly accepted interests from.
            {'\n\n'}
            We do not sell or lease your personal information to third parties. All photos are stored securely in Supabase storage buckets under strict Row Level Security policies.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    paddingRight: 16,
  },
  backText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default PrivacyScreen;
