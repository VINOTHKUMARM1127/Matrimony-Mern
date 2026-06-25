/**
 * Wedring Matrimony — Horoscope Registration (Step 5)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import StepIndicator from '../../components/registration/StepIndicator';
import { STARS, RAASIS, DOSHAM_OPTIONS } from '../../utils/constants';
import useProfileStore from '../../store/useProfileStore';
import useAuthStore from '../../store/useAuthStore';

const HoroscopeScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const horoscope = useProfileStore((s) => s.horoscope);
  const { saveHoroscope, isLoading } = useProfileStore();

  const [star, setStar] = useState(horoscope?.nakshatra || '');
  const [raasi, setRaasi] = useState(horoscope?.rasi || '');
  const [lagnam, setLagnam] = useState(horoscope?.lagnam || '');
  const [gothram, setGothram] = useState(horoscope?.gothram || '');
  const [dosham, setDosham] = useState(horoscope?.dosham || '');
  const [dasaBalance, setDasaBalance] = useState(horoscope?.dasa_balance || '');

  const handleNext = useCallback(async () => {
    if (!star || !raasi) {
      alert("Star and Raasi are mandatory fields.");
      return;
    }

    try {
      await saveHoroscope({
        user_id: user.id,
        nakshatra: star,
        rasi: raasi,
        lagnam: lagnam || null,
        gothram: gothram.trim() || null,
        dosham: dosham || null,
        dasa_balance: dasaBalance.trim() || null,
      });
      navigation.navigate('Lifestyle');
    } catch (error) {
      console.error('Save error:', error);
    }
  }, [star, raasi, lagnam, gothram, dosham, dasaBalance, user, saveHoroscope, navigation]);

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={4} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Horoscope Details</Text>
        <Text style={styles.subtitle}>Help find astrologically compatible matches</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>⭐</Text>
          <Text style={styles.infoText}>
            Horoscope details help us check star compatibility (10 Porutham) for matching profiles
          </Text>
        </View>

        <OptionSelector
          label="Star / Nakshatra (நட்சத்திரம்) *"
          options={STARS}
          value={star}
          onChange={setStar}
          columns={3}
        />

        <OptionSelector
          label="Raasi / Moon Sign (ராசி) *"
          options={RAASIS}
          value={raasi}
          onChange={setRaasi}
          columns={3}
        />

        <OptionSelector
          label="Lagnam / Ascendant"
          options={RAASIS}
          value={lagnam}
          onChange={setLagnam}
          columns={3}
        />

        <Input
          label="Gothram"
          value={gothram}
          onChangeText={setGothram}
          placeholder="Enter your gothram"
        />

        <OptionSelector
          label="Dosham / Chevvai"
          options={DOSHAM_OPTIONS}
          value={dosham}
          onChange={setDosham}
          columns={3}
        />

        <Input
          label="Dasa Balance"
          value={dasaBalance}
          onChangeText={setDasaBalance}
          placeholder="e.g., Rahu 2 years"
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  infoBox: {
    flexDirection: 'row', backgroundColor: colors.secondarySurface, padding: 14,
    borderRadius: 12, marginBottom: 24, alignItems: 'center',
  },
  infoIcon: { fontSize: 24, marginRight: 12 },
  infoText: { flex: 1, fontSize: 13, color: colors.secondary, lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  backButton: { flex: 1 },
  skipButton: { flex: 0.8 },
  nextButton: { flex: 1.5 },
});

export default HoroscopeScreen;
