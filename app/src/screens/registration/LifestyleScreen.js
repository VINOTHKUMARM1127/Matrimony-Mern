/**
 * Wedring Matrimony — Lifestyle Registration (Step 6)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import StepIndicator from '../../components/registration/StepIndicator';
import {
  FOOD_HABITS, LANGUAGES, INTERESTS_OPTIONS,
} from '../../utils/constants';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';

const LifestyleScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const { saveProfile, isLoading } = useProfileStore();

  const [foodHabit, setFoodHabit] = useState(profile?.food_habit || '');
  const [languages, setLanguages] = useState(profile?.languages_known || ['Tamil']);
  const [interests, setInterests] = useState(profile?.interests || []);

  const handleNext = useCallback(async () => {
    try {
      await saveProfile({
        id: user.id,
        food_habit: foodHabit || null,
        languages_known: languages.length > 0 ? languages : ['Tamil'],
        interests: interests.length > 0 ? interests : null,
        hobbies: interests.length > 0 ? interests : null,
      });
      navigation.navigate('PhotoUpload');
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [foodHabit, languages, interests, user, saveProfile, navigation]);

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={5} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Lifestyle & Interests</Text>
        <Text style={styles.subtitle}>Let matches know your preferences</Text>

        <OptionSelector
          label="Food Habit"
          options={FOOD_HABITS}
          value={foodHabit}
          onChange={setFoodHabit}
          columns={3}
        />


        <OptionSelector
          label="Languages Known"
          options={LANGUAGES}
          value={languages}
          onChange={setLanguages}
          multiple
          columns={3}
        />

        <OptionSelector
          label="Interests & Hobbies"
          options={INTERESTS_OPTIONS}
          value={interests}
          onChange={setInterests}
          multiple
          columns={3}
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
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  backButton: { flex: 1 },
  nextButton: { flex: 2 },
});

export default LifestyleScreen;
