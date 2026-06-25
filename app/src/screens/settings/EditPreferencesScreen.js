/**
 * Wedring Matrimony — EditPreferencesScreen Component
 * Interface to edit partner matching preferences (ages, heights, religions, castes, etc.)
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import SearchablePicker from '../../components/common/SearchablePicker';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';
import { RELIGIONS, CASTES, HEIGHT_OPTIONS } from '../../utils/constants';

const EditPreferencesScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const preferences = useProfileStore((s) => s.partnerPreferences);
  const savePartnerPreferences = useProfileStore((s) => s.savePartnerPreferences);
  const showToast = useToastStore((state) => state.showToast);

  // Intelligent age preferences: defaults based on user's own age (min 18, max user's age)
  const [ageMin, setAgeMin] = useState(() => {
    if (preferences?.age_min) return String(preferences.age_min);
    if (profile?.date_of_birth) {
      const birth = new Date(profile.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return String(Math.max(18, age - 3));
    }
    return '18';
  });

  const [ageMax, setAgeMax] = useState(() => {
    if (preferences?.age_max) return String(preferences.age_max);
    if (profile?.date_of_birth) {
      const birth = new Date(profile.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return String(age);
    }
    return '60';
  });

  const [religion, setReligion] = useState(preferences?.religion?.[0] || '');
  
  const [caste, setCaste] = useState(() => {
    if (preferences?.caste && preferences.caste.length > 0) return preferences.caste;
    return profile?.caste ? [profile.caste] : ['Caste No Bar'];
  });

  // Intelligent height preferences: max defaults to user's height, min to height - 15cm
  const [heightMin, setHeightMin] = useState(() => {
    if (preferences?.height_min) return String(preferences.height_min);
    if (profile?.height_cm) return String(Math.max(140, profile.height_cm - 15));
    return '140';
  });

  const [heightMax, setHeightMax] = useState(() => {
    if (preferences?.height_max) return String(preferences.height_max);
    if (profile?.height_cm) return String(profile.height_cm);
    return '210';
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const casteOptions = React.useMemo(() => {
    return CASTES[profile?.religion] || CASTES['Hindu'] || [];
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await savePartnerPreferences({
        user_id: user.id,
        age_min: ageMin ? parseInt(ageMin, 10) : 18,
        age_max: ageMax ? parseInt(ageMax, 10) : 60,
        religion: religion ? [religion] : [],
        caste: caste.length > 0 ? caste : null,
        height_min: heightMin ? parseInt(heightMin, 10) : null,
        height_max: heightMax ? parseInt(heightMax, 10) : null,
      });
      setIsSaving(false);
      showToast('success', 'Success', 'Partner preferences updated successfully!');
      navigation.goBack();
    } catch (err) {
      setIsSaving(false);
      showToast('error', 'Error', err.message || 'Failed to save preferences');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Preferences</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Input
              label="Min Age"
              value={ageMin}
              onChangeText={setAgeMin}
              keyboardType="numeric"
              placeholder="18"
            />
          </View>
          <View style={styles.flex1}>
            <Input
              label="Max Age"
              value={ageMax}
              onChangeText={setAgeMax}
              keyboardType="numeric"
              placeholder="60"
            />
          </View>
        </View>

        <OptionSelector
          label="Preferred Religion"
          options={RELIGIONS}
          value={religion}
          onChange={setReligion}
          columns={2}
        />

        <SearchablePicker
          label="Preferred Caste"
          placeholder="Select preferred caste(s)"
          searchPlaceholder="Search caste..."
          options={casteOptions}
          value={caste}
          onChange={setCaste}
          multiple
          noPreferenceValue="Caste No Bar"
        />

        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: -6 }}>Height Range</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <SearchablePicker
              placeholder="Min height"
              searchPlaceholder="Search height..."
              options={HEIGHT_OPTIONS}
              value={heightMin ? parseInt(heightMin, 10) : ''}
              onChange={(val) => setHeightMin(val ? String(val) : '')}
            />
          </View>
          <View style={styles.flex1}>
            <SearchablePicker
              placeholder="Max height"
              searchPlaceholder="Search height..."
              options={HEIGHT_OPTIONS}
              value={heightMax ? parseInt(heightMax, 10) : ''}
              onChange={(val) => setHeightMax(val ? String(val) : '')}
            />
          </View>
        </View>

        <Button
          title="Save Preferences"
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  saveBtn: {
    marginTop: 20,
  },
});

export default EditPreferencesScreen;
