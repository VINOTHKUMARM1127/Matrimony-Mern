/**
 * Wedring Matrimony — Basic Info Registration Screen (Step 1)
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert, BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import StepIndicator from '../../components/registration/StepIndicator';
import { GENDERS, MARITAL_STATUS, HEIGHT_OPTIONS, WEIGHT_OPTIONS, PHYSICAL_STATUS } from '../../utils/constants';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';

const BasicInfoScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const { saveProfile, isLoading } = useProfileStore();
  const { signOut } = useAuthStore();

  const [name, setName] = useState(profile?.name || '');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState(profile?.height_cm ? profile.height_cm.toString() : '');
  const [physicalStatus, setPhysicalStatus] = useState(profile?.physical_status || '');
  const [maritalStatus, setMaritalStatus] = useState(profile?.marital_status || '');
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!gender) newErrors.gender = 'Please select gender';
    if (!dob) newErrors.dob = 'Date of birth is required';
    else {
      // Basic DOB validation (DD/MM/YYYY)
      const parts = dob.split('/');
      if (parts.length !== 3 || parts[2].length !== 4) {
        newErrors.dob = 'Enter date as DD/MM/YYYY';
      } else {
        const date = new Date(parts[2], parts[1] - 1, parts[0]);
        const age = new Date().getFullYear() - date.getFullYear();
        if (age < 18) newErrors.dob = 'Must be at least 18 years old';
        if (age > 70) newErrors.dob = 'Please enter a valid date';
      }
    }
    if (!maritalStatus) newErrors.maritalStatus = 'Please select marital status';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, gender, dob, maritalStatus]);

  const handleNext = useCallback(async () => {
    if (!validate()) return;

    const parts = dob.split('/');
    const dateOfBirth = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;

    try {
      await saveProfile({
        id: user.id,
        name: name.trim(),
        gender,
        date_of_birth: dateOfBirth,
        height_cm: height ? parseInt(height) : null,
        physical_status: physicalStatus || null,
        marital_status: maritalStatus,
      });
      navigation.navigate('ReligionCaste');
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [validate, name, gender, dob, height, maritalStatus, user, saveProfile, navigation]);

  const formatDob = useCallback((text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  }, []);

  const handleExit = useCallback(() => {
    Alert.alert(
      'Exit Registration',
      'Are you sure you want to exit? You must complete your profile to find matches.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit to Login', 
          style: 'destructive', 
          onPress: () => signOut() 
        },
      ]
    );
    return true; // prevent default back button behavior
  }, [signOut]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleExit);
    return () => backHandler.remove();
  }, [handleExit]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>
      <StepIndicator currentStep={0} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Let's start with your basic details</Text>

        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          autoCapitalize="words"
          error={errors.name}
          required
        />

        <OptionSelector
          label="Gender"
          options={GENDERS}
          value={gender}
          onChange={setGender}
          columns={2}
          required
          error={errors.gender}
        />

        <Input
          label="Date of Birth"
          value={dob}
          onChangeText={(text) => setDob(formatDob(text))}
          placeholder="DD/MM/YYYY"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.dob}
          required
        />

        <Text style={styles.sectionLabel}>Height (Optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heightScroll}>
          {HEIGHT_OPTIONS.filter((_, i) => i % 3 === 0).map((h) => (
            <TouchableOpacity
              key={h.value}
              onPress={() => setHeight(h.value.toString())}
              style={[
                styles.heightChip,
                height === h.value.toString() && styles.heightChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.heightChipText,
                  height === h.value.toString() && styles.heightChipTextSelected,
                ]}
              >
                {h.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>


        <OptionSelector
          label="Physical Status"
          options={PHYSICAL_STATUS}
          value={physicalStatus}
          onChange={setPhysicalStatus}
          columns={2}
          required={false}
        />

        <OptionSelector
          label="Marital Status"
          options={MARITAL_STATUS}
          value={maritalStatus}
          onChange={setMaritalStatus}
          columns={2}
          required
          error={errors.maritalStatus}
        />

        <Button
          title="Next →"
          onPress={handleNext}
          loading={isLoading}
          style={styles.nextButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  exitButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surfaceElevated, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight },
  exitText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginBottom: 10 },
  heightScroll: { marginBottom: 20, maxHeight: 44 },
  heightChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.border, marginRight: 8, backgroundColor: colors.background,
  },
  heightChipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  heightChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  heightChipTextSelected: { color: colors.primary, fontWeight: '600' },
  nextButton: { marginTop: 16 },
});

export default BasicInfoScreen;
