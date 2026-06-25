/**
 * Wedring Matrimony — Partner Preference Registration (Step 8 - Final)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import StepIndicator from '../../components/registration/StepIndicator';
import {
  RELIGIONS, EDUCATION_LEVELS, OCCUPATIONS, FOOD_HABITS,
  MARITAL_STATUS, CASTES, HEIGHT_OPTIONS,
} from '../../utils/constants';
import SearchablePicker from '../../components/common/SearchablePicker';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';
import computeCompleteness from '../../utils/profileCompleteness';

const PartnerPreferenceScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const { savePartnerPreferences, updateProfile, isLoading } = useProfileStore();

  // Intelligent age preferences: defaults based on user's own age (min 18, max user's age)
  const [ageMin, setAgeMin] = useState(() => {
    if (profile?.date_of_birth) {
      const birth = new Date(profile.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return String(Math.max(18, age - 3));
    }
    return '21';
  });

  const [ageMax, setAgeMax] = useState(() => {
    if (profile?.date_of_birth) {
      const birth = new Date(profile.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return String(age);
    }
    return '35';
  });

  // Intelligent height preferences: max defaults to user's height, min to height - 15cm
  const [heightMin, setHeightMin] = useState(() => {
    if (profile?.height_cm) {
      return String(Math.max(140, profile.height_cm - 15));
    }
    return '140';
  });

  const [heightMax, setHeightMax] = useState(() => {
    if (profile?.height_cm) {
      return String(profile.height_cm);
    }
    return '210';
  });
  const [maritalStatus, setMaritalStatus] = useState([]);
  const [religion, setReligion] = useState([]);
  
  // Default to user's own caste, otherwise select Caste No Bar
  const [caste, setCaste] = useState(() => profile?.caste ? [profile.caste] : ['Caste No Bar']);
  
  const [education, setEducation] = useState([]);
  const [occupation, setOccupation] = useState([]);
  const [foodHabit, setFoodHabit] = useState([]);

  // Exclusive selection: choosing "No Education Bar" clears other fields and vice-versa
  const handleEducationChange = useCallback((newValues) => {
    const noPref = 'No Education Bar';
    const hasNoPref = newValues.includes(noPref);
    const hadNoPref = education.includes(noPref);

    if (hasNoPref) {
      if (hadNoPref) {
        setEducation(newValues.filter((v) => v !== noPref));
      } else {
        setEducation([noPref]);
      }
    } else {
      setEducation(newValues.filter((v) => v !== noPref));
    }
  }, [education]);

  const casteOptions = React.useMemo(() => {
    return CASTES[profile?.religion] || CASTES['Hindu'] || [];
  }, [profile]);

  const handleComplete = useCallback(async () => {
    try {
      const prefPayload = {
        user_id: user.id,
        pref_age_min: parseInt(ageMin) || 18,
        pref_age_max: parseInt(ageMax) || 60,
        pref_height_min: heightMin ? parseInt(heightMin) : null,
        pref_height_max: heightMax ? parseInt(heightMax) : null,
        pref_marital_status: maritalStatus.length > 0 ? maritalStatus : null,
        pref_religion: religion.length > 0 ? religion : null,
        pref_caste: caste.length > 0 ? caste : null,
        pref_education: education.length > 0 ? education : null,
        pref_occupation: occupation.length > 0 ? occupation : null,
        pref_food_habit: foodHabit.length > 0 ? foodHabit : null,
      };
      await savePartnerPreferences(prefPayload);

      // Compute a real completion % from the full profile + relations
      // (single source of truth — no hardcoded 100).
      const { profile, horoscope, photos } = useProfileStore.getState();
      const { percent } = computeCompleteness(profile || {}, {
        horoscope,
        preferences: prefPayload,
        photos,
      });

      await updateProfile(user.id, {
        profile_completion: percent,
      });

      Alert.alert(
        '🎉 Profile Complete!',
        `Your profile is ${percent}% complete. Start exploring matches!`,
        [{ text: 'Let\'s Go!', onPress: () => {} }]
      );
      // Navigation will be handled by AppNavigator based on profile completion
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message || 'Failed to save preferences. Please try again.');
    }
  }, [ageMin, ageMax, heightMin, heightMax, maritalStatus, religion, caste, education, occupation, foodHabit, user, savePartnerPreferences, updateProfile]);

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={7} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Partner Preferences</Text>
        <Text style={styles.subtitle}>What are you looking for in a partner?</Text>

        <Text style={styles.sectionTitle}>Age Range</Text>
        <View style={styles.rangeRow}>
          <Input
            label="Min Age"
            value={ageMin}
            onChangeText={setAgeMin}
            keyboardType="number-pad"
            maxLength={2}
            containerStyle={styles.rangeInput}
          />
          <Text style={styles.rangeDash}>to</Text>
          <Input
            label="Max Age"
            value={ageMax}
            onChangeText={setAgeMax}
            keyboardType="number-pad"
            maxLength={2}
            containerStyle={styles.rangeInput}
          />
        </View>

        <Text style={styles.sectionTitle}>Height Range</Text>
        <View style={styles.rangeRow}>
          <View style={{ flex: 1 }}>
            <SearchablePicker
              label="Min Height"
              placeholder="Min height"
              searchPlaceholder="Search height..."
              options={HEIGHT_OPTIONS}
              value={heightMin ? parseInt(heightMin, 10) : ''}
              onChange={(val) => setHeightMin(val ? String(val) : '')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SearchablePicker
              label="Max Height"
              placeholder="Max height"
              searchPlaceholder="Search height..."
              options={HEIGHT_OPTIONS}
              value={heightMax ? parseInt(heightMax, 10) : ''}
              onChange={(val) => setHeightMax(val ? String(val) : '')}
            />
          </View>
        </View>

        <OptionSelector
          label="Marital Status"
          options={MARITAL_STATUS}
          value={maritalStatus}
          onChange={setMaritalStatus}
          multiple
          columns={2}
        />

        <OptionSelector
          label="Religion"
          options={RELIGIONS}
          value={religion}
          onChange={setReligion}
          multiple
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

        <OptionSelector
          label="Education"
          options={EDUCATION_LEVELS.slice(0, 13)}
          value={education}
          onChange={handleEducationChange}
          multiple
          columns={3}
        />

        <OptionSelector
          label="Occupation"
          options={OCCUPATIONS.slice(0, 10)}
          value={occupation}
          onChange={setOccupation}
          multiple
          columns={2}
        />

        <OptionSelector
          label="Food Habit"
          options={FOOD_HABITS}
          value={foodHabit}
          onChange={setFoodHabit}
          multiple
          columns={3}
        />

        <View style={styles.buttonRow}>
          <Button title="← Back" onPress={() => navigation.goBack()} variant="outline" style={styles.backButton} />
          <Button
            title="Complete Profile ✓"
            onPress={handleComplete}
            loading={isLoading}
            style={styles.completeButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  rangeInput: { flex: 1, marginBottom: 0 },
  rangeDash: { fontSize: 14, color: colors.textMuted, marginTop: 20 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backButton: { flex: 1 },
  completeButton: { flex: 2 },
});

export default PartnerPreferenceScreen;
