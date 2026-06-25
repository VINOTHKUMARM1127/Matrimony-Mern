/**
 * Wedring Matrimony — Create Account Screen
 * New user registration with OTP verification.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar, ScrollView, Alert, Modal
} from 'react-native';
import { SafeAreaView as SafeAreaContextView } from 'react-native-safe-area-context';
import { colors, shadows, borderRadius } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import OptionSelector from '../../components/registration/OptionSelector';
import useAuthStore from '../../store/useAuthStore';

const PROFILE_FOR_OPTIONS = [
  { label: 'Myself', value: 'self' },
  { label: 'Son', value: 'son' },
  { label: 'Daughter', value: 'daughter' },
  { label: 'Brother', value: 'brother' },
  { label: 'Sister', value: 'sister' },
  { label: 'Friend', value: 'friend' },
  { label: 'Relative', value: 'relative' },
];

const MOTHER_TONGUE_OPTIONS = [
  { label: 'Tamil', value: 'tamil' },
  { label: 'English', value: 'english' },
  { label: 'Telugu', value: 'telugu' },
  { label: 'Malayalam', value: 'malayalam' },
  { label: 'Kannada', value: 'kannada' },
  { label: 'Hindi', value: 'hindi' },
];

const CreateAccountScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [profileFor, setProfileFor] = useState('');
  const [motherTongue, setMotherTongue] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { signUpWithPassword, checkUserExists, clearError } = useAuthStore();

  const validateStep1 = () => {
    const newErrors = {};
    if (!profileFor) newErrors.profileFor = 'Please select who you are creating this profile for';
    if (!motherTongue) newErrors.motherTongue = 'Please select mother tongue';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!email.trim() || !isEmailValid) newErrors.email = 'Valid email is required';
    
    const cleanedPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 10) newErrors.phone = 'Valid 10-digit phone number is required';

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCreateAccountClick = async () => {
    if (!validateStep2()) return;
    clearError();
    setIsProcessing(true);

    const enteredEmail = email.trim();
    const enteredPhone = phone.trim().replace(/[^0-9]/g, '');
    const formattedPhone = enteredPhone.startsWith('91') && enteredPhone.length > 10 
      ? `+${enteredPhone}` 
      : `+91${enteredPhone.slice(-10)}`;

    try {
      // Verify if the user already exists in the system
      const userAlreadyExists = await checkUserExists(enteredEmail, formattedPhone);
      
      if (userAlreadyExists) {
        Alert.alert(
          'Account Already Exists',
          'An account with this email or phone number already exists. Please use different details or Sign In.',
          [
            { text: 'Use Different Details', style: 'cancel' },
            { text: 'Go to Login', onPress: () => {
              setShowOtpModal(false);
              navigation.navigate('Login');
            }}
          ]
        );
        setIsProcessing(false);
        return;
      }
      
      // If no duplicate, show the OTP Method Selection Modal
      setShowOtpModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify account details. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMobileOtp = () => {
    Alert.alert('Coming Soon', 'Mobile OTP is currently under process. Please verify via Email OTP.');
  };

  const handleEmailOtp = async () => {
    setIsProcessing(true);
    const enteredEmail = email.trim();
    const enteredPhone = phone.trim().replace(/[^0-9]/g, '');
    const formattedPhone = enteredPhone.startsWith('91') && enteredPhone.length > 10 
      ? `+${enteredPhone}` 
      : `+91${enteredPhone.slice(-10)}`;

    const success = await signUpWithPassword(enteredEmail, password, {
      profileFor,
      motherTongue,
      phone: formattedPhone,
      name: '' // Empty name
    });

    setIsProcessing(false);

    if (success) {
      setShowOtpModal(false);
      // Navigate to OTP verification passing all registration details
      navigation.navigate('OTP', {
        mode: 'signup',
        email: enteredEmail,
        phone: formattedPhone,
      });
    } else {
      Alert.alert('Error', useAuthStore.getState().error || 'Failed to send Email OTP. Please try again later.');
    }
  };

  return (
    <SafeAreaContextView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity style={styles.backButton} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>✦</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Wedring Matrimony and find your perfect match</Text>
          </View>

          <View style={styles.form}>
            {step === 1 ? (
              <>
                <OptionSelector
                  label="Creating Profile For"
                  options={PROFILE_FOR_OPTIONS}
                  value={profileFor}
                  onChange={(val) => { setProfileFor(val); setErrors((prev) => ({ ...prev, profileFor: undefined })); }}
                  columns={2}
                  error={errors.profileFor}
                  required
                />
                
                <View style={{ marginTop: 16 }}>
                  <OptionSelector
                    label="Mother Tongue"
                    options={MOTHER_TONGUE_OPTIONS}
                    value={motherTongue}
                    onChange={(val) => { setMotherTongue(val); setErrors((prev) => ({ ...prev, motherTongue: undefined })); }}
                    columns={2}
                    error={errors.motherTongue}
                    required
                  />
                </View>

                <Button title="Next →" onPress={handleNextStep1} style={styles.submitBtn} />
              </>
            ) : (
              <>
                <View style={{ marginTop: 8 }}>
                  <Input
                    label="Email ID"
                    placeholder="e.g., user@example.com"
                    value={email}
                    onChangeText={(text) => { setEmail(text); setErrors((prev) => ({ ...prev, email: undefined })); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    required
                  />
                </View>

                <Input
                  label="Phone Number"
                  placeholder="e.g., 9876543210"
                  value={phone}
                  onChangeText={(text) => { setPhone(text); setErrors((prev) => ({ ...prev, phone: undefined })); }}
                  keyboardType="phone-pad"
                  error={errors.phone}
                  required
                />
                
                <Input
                  label="Password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  secureTextEntry
                  error={errors.password}
                  required
                />
                
                <Button 
                  title="Create Account" 
                  onPress={handleCreateAccountClick} 
                  loading={isProcessing} 
                  style={{ marginTop: 16, marginBottom: 24 }} 
                />
              </>
            )}

            <View style={styles.signinRow}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Method Selection Modal */}
      <Modal
        visible={showOtpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Verification Method</Text>
              <TouchableOpacity onPress={() => setShowOtpModal(false)} style={styles.closeBtn}>
                <Text style={{ fontSize: 20, color: colors.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Where should we send your verification OTP?</Text>
            
            <View style={styles.methodButtons}>
              <TouchableOpacity style={styles.methodCard} onPress={handleEmailOtp} disabled={isProcessing}>
                <View style={[styles.iconBox, { backgroundColor: colors.primarySurface }]}>
                  <Text style={{ fontSize: 20 }}>✉</Text>
                </View>
                <View style={styles.methodTextContainer}>
                  <Text style={styles.methodTitle}>Email OTP</Text>
                  <Text style={styles.methodDesc}>Send code to {email || 'your email'}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.methodCard} onPress={handleMobileOtp} disabled={isProcessing}>
                <View style={[styles.iconBox, { backgroundColor: '#f3f4f6' }]}>
                  <Text style={{ fontSize: 20 }}>📱</Text>
                </View>
                <View style={styles.methodTextContainer}>
                  <Text style={[styles.methodTitle, { color: '#6b7280' }]}>Mobile OTP</Text>
                  <Text style={styles.methodDesc}>Currently under process</Text>
                </View>
              </TouchableOpacity>
            </View>

            {isProcessing && (
              <Text style={styles.processingText}>Processing...</Text>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaContextView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: Platform.OS === 'ios' ? 10 : 40 },
  backButton: { paddingVertical: 8, marginBottom: 8 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.secondarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: 14, ...shadows.button },
  logoBadgeText: { fontSize: 26, color: colors.secondary },
  title: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  form: { flex: 1 },
  submitBtn: { marginTop: 24, marginBottom: 24 },
  signinRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  signinText: { fontSize: 14, color: colors.textSecondary },
  signinLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  methodButtons: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: '#fff',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  processingText: {
    textAlign: 'center',
    marginTop: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default CreateAccountScreen;
