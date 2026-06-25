/**
 * Wedring Matrimony — Family Details Registration (Step 4)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import StepIndicator from '../../components/registration/StepIndicator';
import { FAMILY_TYPES, FAMILY_STATUS, FAMILY_VALUES, TN_DISTRICTS } from '../../utils/constants';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';

const FamilyScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const familyDetails = useProfileStore((s) => s.familyDetails);
  const { saveProfile, saveFamilyDetails, isLoading } = useProfileStore();

  // Family details (stored in family_details table)
  const [fatherName, setFatherName] = useState(familyDetails?.father_name || '');
  const [motherName, setMotherName] = useState(familyDetails?.mother_name || '');
  const [familyType, setFamilyType] = useState(familyDetails?.family_type || '');
  const [familyStatus, setFamilyStatus] = useState(familyDetails?.family_status || '');
  const [familyValues, setFamilyValues] = useState(familyDetails?.family_values || '');
  const [brothers, setBrothers] = useState(familyDetails?.number_of_brothers?.toString() || '0');
  const [sisters, setSisters] = useState(familyDetails?.number_of_sisters?.toString() || '0');

  // Location + About Me (stored in profiles table)
  const [city, setCity] = useState(profile?.city || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [state, setState] = useState(profile?.state || 'Tamil Nadu');
  const [aboutMe, setAboutMe] = useState(profile?.about_me || '');

  const handleNext = useCallback(async () => {
    if (!city.trim() || !district) {
      Alert.alert('Required Fields', 'Please enter your City and select your District to continue.');
      return;
    }

    try {
      // Save family details to family_details table
      await saveFamilyDetails({
        user_id: user.id,
        father_name: fatherName.trim() || null,
        mother_name: motherName.trim() || null,
        family_type: familyType || null,
        family_status: familyStatus || null,
        family_values: familyValues || null,
        number_of_brothers: parseInt(brothers) || 0,
        number_of_sisters: parseInt(sisters) || 0,
      });

      // Save location + about me to profiles table
      await saveProfile({
        id: user.id,
        city: city.trim() || null,
        district: district || null,
        state: state || null,
        country: 'India',
        about_me: aboutMe.trim() || null,
      });

      navigation.navigate('Horoscope');
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [fatherName, motherName, familyType, familyStatus, familyValues, brothers, sisters, city, district, state, aboutMe, user, saveProfile, saveFamilyDetails, navigation]);

  const districtOptions = TN_DISTRICTS.map((d) => ({ label: d, value: d }));

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={3} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Family & Location</Text>
        <Text style={styles.subtitle}>Help matches know about your family</Text>

        <Input
          label="Father's Name"
          value={fatherName}
          onChangeText={setFatherName}
          placeholder="Enter father's name"
        />

        <Input
          label="Mother's Name"
          value={motherName}
          onChangeText={setMotherName}
          placeholder="Enter mother's name"
        />

        <OptionSelector
          label="Family Type"
          options={FAMILY_TYPES}
          value={familyType}
          onChange={setFamilyType}
          columns={2}
        />

        <OptionSelector
          label="Family Status"
          options={FAMILY_STATUS}
          value={familyStatus}
          onChange={setFamilyStatus}
          columns={2}
        />

        <OptionSelector
          label="Family Values"
          options={FAMILY_VALUES}
          value={familyValues}
          onChange={setFamilyValues}
          columns={2}
        />

        <View style={styles.siblingRow}>
          <Input
            label="Brothers"
            value={brothers}
            onChangeText={setBrothers}
            keyboardType="number-pad"
            maxLength={2}
            containerStyle={styles.siblingInput}
          />
          <Input
            label="Sisters"
            value={sisters}
            onChangeText={setSisters}
            keyboardType="number-pad"
            maxLength={2}
            containerStyle={styles.siblingInput}
          />
        </View>

        <Text style={styles.sectionTitle}>📍 Location</Text>

        <Input
          label="City *"
          value={city}
          onChangeText={setCity}
          placeholder="Enter your city"
        />

        <OptionSelector
          label="District *"
          options={districtOptions}
          value={district}
          onChange={setDistrict}
          columns={3}
        />

        <Input
          label="About Me"
          value={aboutMe}
          onChangeText={setAboutMe}
          placeholder="Write a brief about yourself..."
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <View style={styles.buttonRow}>
          <Button title="← Back" onPress={() => navigation.goBack()} variant="outline" style={styles.backButton} />
          <Button title="Next →" onPress={handleNext} loading={isLoading} style={styles.nextButton} />
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
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginTop: 8, marginBottom: 16 },
  siblingRow: { flexDirection: 'row', gap: 8 },
  siblingInput: { flex: 1 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  backButton: { flex: 1 },
  nextButton: { flex: 2 },
});

export default FamilyScreen;
