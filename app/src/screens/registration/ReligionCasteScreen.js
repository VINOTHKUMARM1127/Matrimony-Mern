/**
 * Wedring Matrimony — Religion & Caste Registration (Step 2)
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import StepIndicator from '../../components/registration/StepIndicator';
import SearchablePicker from '../../components/common/SearchablePicker';
import { RELIGIONS, CASTES } from '../../utils/constants';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';

const ReligionCasteScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const { saveProfile, isLoading } = useProfileStore();

  const [religion, setReligion] = useState(profile?.religion || '');
  
  const initialIsCustomCaste = useMemo(() => {
    if (!profile?.caste) return false;
    const options = CASTES[profile.religion] || [];
    return !options.some(opt => opt.value === profile.caste);
  }, [profile]);

  const [caste, setCaste] = useState(() => {
    if (initialIsCustomCaste) return 'Other';
    return profile?.caste || '';
  });

  const [customCaste, setCustomCaste] = useState(() => {
    if (initialIsCustomCaste) return profile.caste;
    return '';
  });

  const [subcaste, setSubcaste] = useState(profile?.subcaste || '');

  const [errors, setErrors] = useState({});

  const casteOptions = useMemo(() => {
    return CASTES[religion] || [];
  }, [religion]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!religion) newErrors.religion = 'Please select your religion';
    if (caste === 'Other' && !customCaste.trim()) {
      newErrors.customCaste = 'Please specify your caste';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [religion, caste, customCaste]);

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    try {
      const finalCaste = caste === 'Other' ? customCaste.trim() : caste;
      await saveProfile({
        id: user.id,
        religion,
        caste: finalCaste || null,
        subcaste: subcaste.trim() || null,

      });
      navigation.navigate('Education');
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [validate, religion, caste, customCaste, subcaste, user, saveProfile, navigation]);

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={1} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Religion & Community</Text>
        <Text style={styles.subtitle}>This helps us find compatible matches</Text>

        <OptionSelector
          label="Religion"
          options={RELIGIONS}
          value={religion}
          onChange={(val) => { setReligion(val); setCaste(''); setCustomCaste(''); }}
          columns={2}
          required
          error={errors.religion}
        />

        {casteOptions.length > 0 && (
          <SearchablePicker
            label="Caste"
            options={casteOptions}
            value={caste}
            onChange={(val) => { setCaste(val); if (val !== 'Other') setCustomCaste(''); }}
            placeholder="Select your caste"
            searchPlaceholder="Search caste..."
          />
        )}

        {caste === 'Other' && (
          <Input
            label="Specify Caste"
            value={customCaste}
            onChangeText={setCustomCaste}
            placeholder="Type your caste"
            error={errors.customCaste}
            required
          />
        )}

        <Input
          label="Sub-caste (Optional)"
          value={subcaste}
          onChangeText={setSubcaste}
          placeholder="Enter your sub-caste"
        />


        <View style={styles.buttonRow}>
          <Button
            title="← Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Next →"
            onPress={handleNext}
            loading={isLoading}
            style={styles.nextButton}
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
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  backButton: { flex: 1 },
  nextButton: { flex: 2 },
});

export default ReligionCasteScreen;
