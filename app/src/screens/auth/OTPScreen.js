/**
 * Wedring Matrimony — OTP Verification Screen
 * 6-digit OTP input with auto-focus, countdown, and resend
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/useAuthStore';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 30;

const OTPScreen = ({ navigation, route }) => {
  const { phone, email } = route.params || {};
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  const { verifyOTP, verifyEmailOTP, sendOTP, sendEmailOTP, isLoading, error, clearError } = useAuthStore();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  const handleOtpChange = useCallback((value, index) => {
    clearError();
    const newOtp = [...otp];

    if (value.length > 1) {
      // Handle paste
      const pastedChars = value.replace(/[^0-9]/g, '').split('').slice(0, OTP_LENGTH);
      pastedChars.forEach((char, i) => {
        if (i + index < OTP_LENGTH) {
          newOtp[i + index] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedChars.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newOtp[index] = value.replace(/[^0-9]/g, '');
      setOtp(newOtp);

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  }, [otp, clearError]);

  const handleKeyPress = useCallback((e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  }, [otp]);

  const handleVerify = useCallback(async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }
    if (email) {
      await verifyEmailOTP(email, otpCode);
    } else {
      await verifyOTP(phone, otpCode);
    }
  }, [otp, phone, email, verifyOTP, verifyEmailOTP]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;
    clearError();
    setCanResend(false);
    setCountdown(RESEND_COUNTDOWN);
    setOtp(Array(OTP_LENGTH).fill(''));
    if (email) {
      await sendEmailOTP(email);
    } else {
      await sendOTP(phone);
    }
    inputRefs.current[0]?.focus();
  }, [canResend, phone, email, sendOTP, sendEmailOTP, clearError]);

  const displayTarget = email 
    ? email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, rest) => `${first}${'*'.repeat(middle.length)}${rest}`)
    : phone?.replace(/(\+91)(\d{3})(\d{4})(\d{3})/, '$1 $2 **** $4') || '';
  const isComplete = otp.every((d) => d !== '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{displayTarget}</Text>
        </Text>
      </View>

      {/* OTP Inputs */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.otpInput,
              digit && styles.otpInputFilled,
              error && styles.otpInputError,
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            selectTextOnFocus
            caretHidden
          />
        ))}
      </View>

      {/* Error */}
      {error && (
        <Text style={styles.errorText}>⚠️ {error}</Text>
      )}

      {/* Verify button */}
      <Button
        title="Verify & Continue"
        onPress={handleVerify}
        loading={isLoading}
        disabled={!isComplete}
        style={styles.verifyButton}
      />

      {/* Resend */}
      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.resendText}>
            Resend OTP in <Text style={styles.countdown}>{countdown}s</Text>
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  phone: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  otpInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  countdown: {
    fontWeight: '600',
    color: colors.primary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default OTPScreen;
