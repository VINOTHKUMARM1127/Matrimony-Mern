import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/useAuthStore';

const OTPVerifyScreen = ({ route, navigation }) => {
  const email = route.params?.email || '';
  const phone = route.params?.phone || '';
  const mode = route.params?.mode || 'login'; // 'login' | 'signup' | 'reset'
  const isEmail = !!email;
  const identifier = email || phone;

  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [localError, setLocalError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { verifySignupOTP, verifyEmailOTP, verifyOTP, sendEmailOTP, sendOTP, resendSignupOTP, error, clearError } = useAuthStore();
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    // If the global store has an error, show it
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Check if it's a pasted/multi-character value
    if (cleaned.length > 1) {
      // If it looks like a full OTP paste (6 to 8 digits)
      if (cleaned.length >= 6) {
        const newOtp = [...otp];
        const digits = cleaned.split('').slice(0, 8);
        for (let i = 0; i < 8; i++) {
          newOtp[i] = digits[i] || '';
        }
        setOtp(newOtp);
        const targetIndex = Math.min(digits.length, 7);
        inputRefs.current[targetIndex]?.focus();
        return;
      } else {
        // Fast type or double digit, take the last character
        const digit = cleaned.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (index < 7) {
          inputRefs.current[index + 1]?.focus();
        }
        return;
      }
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-focus next box
    if (cleaned && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    clearError();
    setLocalError('');
    const otpCode = otp.join('');
    
    if (otpCode.length < 8) {
      setLocalError('Please enter a valid 8-digit OTP');
      return;
    }

    setIsVerifying(true);

    try {
      if (mode === 'signup') {
        const success = await verifySignupOTP(email, otpCode);
        if (!success) {
          setLocalError(useAuthStore.getState().error || 'Invalid OTP, please try again');
        }
        // AppNavigator will automatically route to Registration flow because session is created
      } else {
        // Standard Login Verification
        let success = false;
        if (isEmail) {
          success = await verifyEmailOTP(email, otpCode);
        } else {
          success = await verifyOTP(phone, otpCode);
        }

        if (!success) {
          if (!useAuthStore.getState().error) {
            setLocalError('Invalid OTP, please try again');
          }
        } else if (mode === 'reset') {
          navigation.replace('ResetPassword', { email, phone });
        }
      }
    } catch (err) {
      setLocalError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    clearError();
    setLocalError('');
    
    let success = false;
    if (isEmail && mode === 'signup') {
      success = await resendSignupOTP(email);
    } else if (isEmail && mode !== 'signup') {
      success = await sendEmailOTP(email);
    } else {
      success = await sendOTP(phone);
    }

    if (success) {
      setTimer(300);
      setLocalError('OTP resent successfully');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 8-digit code sent to
          {'\n'}
          <Text style={styles.identifierText}>{identifier}</Text>
          {'\n'}
          <Text style={styles.validityText}>Valid for 5 minutes.</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                localError ? styles.otpBoxError : null
              ]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? 8 : 1}
              selectTextOnFocus
            />
          ))}
        </View>

        {localError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {localError}</Text>
          </View>
        ) : <View style={styles.errorPlaceholder} />}

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={isVerifying || useAuthStore.getState().isLoading}
          style={styles.verifyBtn}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
            <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
              {timer > 0 ? `Resend in ${formatTimer(timer)}` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  identifierText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  validityText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 4,
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  otpBoxError: {
    borderColor: colors.error,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorPlaceholder: {
    height: 20,
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  verifyBtn: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  resendDisabled: {
    color: colors.textMuted,
  },
});

export default OTPVerifyScreen;
