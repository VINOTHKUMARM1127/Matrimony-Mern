/**
 * Wedring Matrimony — Education & Career Registration (Step 3)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import StepIndicator from '../../components/registration/StepIndicator';
import { EDUCATION_LEVELS, OCCUPATIONS, INCOME_RANGES } from '../../utils/constants';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';

const EducationScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const { saveProfile, isLoading } = useProfileStore();

  const [education, setEducation] = useState(profile?.highest_qualification || '');
  const [educationDetail, setEducationDetail] = useState('');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [occupationDetail, setOccupationDetail] = useState('');
  const [income, setIncome] = useState(profile?.annual_income || '');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState({});

  const validate = useCallback(() => {
    const newErrors = {};
    if (!education) newErrors.education = 'Please select your education';
    if (!occupation) newErrors.occupation = 'Please select your occupation';
    if (occupation !== 'Not Working' && !income) {
      newErrors.income = 'Please select your annual income';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [education, occupation, income]);

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    try {
      const isNotWorking = occupation === 'Not Working';
      await saveProfile({
        id: user.id,
        highest_qualification: education,
        occupation,
        annual_income: isNotWorking ? null : (income || null),
      });
      navigation.navigate('Family');
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [validate, education, educationDetail, occupation, occupationDetail, income, company, user, saveProfile, navigation]);

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={2} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Education & Career</Text>
        <Text style={styles.subtitle}>Share your professional details</Text>

        <OptionSelector
          label="Education"
          options={EDUCATION_LEVELS}
          value={education}
          onChange={setEducation}
          columns={3}
          required
          error={errors.education}
        />

        <Input
          label="Education Details (Optional)"
          value={educationDetail}
          onChangeText={setEducationDetail}
          placeholder="e.g., Anna University, 2020"
        />

        <OptionSelector
          label="Occupation"
          options={OCCUPATIONS}
          value={occupation}
          onChange={(val) => {
            setOccupation(val);
            if (val === 'Not Working') {
              setOccupationDetail('');
              setCompany('');
              setIncome('');
            }
          }}
          columns={2}
          required
          error={errors.occupation}
        />

        {occupation !== 'Not Working' && occupation !== '' && (
          <>
            <Input
              label="Job Details (Optional)"
              value={occupationDetail}
              onChangeText={setOccupationDetail}
              placeholder="e.g., Software Engineer at TCS"
            />

            <Input
              label="Company Name (Optional)"
              value={company}
              onChangeText={setCompany}
              placeholder="Enter company name"
            />

            <OptionSelector
              label="Annual Income"
              options={INCOME_RANGES}
              value={income}
              onChange={setIncome}
              columns={2}
              required
              error={errors.income}
            />
          </>
        )}

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
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  backButton: { flex: 1 },
  nextButton: { flex: 2 },
});

export default EducationScreen;
