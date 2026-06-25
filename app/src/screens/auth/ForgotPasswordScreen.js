/**
 * Wedring Matrimony — Forgot Password Screen
 * Collects email or mobile to send a password-reset OTP.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { SafeAreaView as SafeAreaContextView } from 'react-native-safe-area-context';
import { colors, borderRadius, shadows } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/useAuthStore';

const ForgotPasswordScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [localError, setLocalError] = useState('');

  const { sendOTP, sendEmailOTP, resetPassword, isLoading, clearError } = useAuthStore();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const isMobile = /^\d{10}$/.test(identifier.trim().replace(/[^0-9]/g, '').slice(-10));

  const handleSendReset = async () => {
    setLocalError('');
    clearError();

    const trimmed = identifier.trim();
    if (!trimmed) {
      setLocalError('Please enter your email or mobile number.');
      return;
    }
    if (!isEmail && !isMobile) {
      setLocalError('Enter a valid email address or 10-digit mobile number.');
      return;
    }

    let success = false;

    if (isEmail) {
      // Use Supabase password reset for email (sends OTP/magic link)
      try {
        await resetPassword(trimmed);
        success = true;
      } catch (e) {
        setLocalError(e.message || 'Failed to send reset email.');
      }
    } else {
      // Use Fast2SMS for mobile
      const cleaned = trimmed.replace(/[^0-9]/g, '');
      const formatted = cleaned.startsWith('91') && cleaned.length > 10
        ? `+${cleaned}` : `+91${cleaned.slice(-10)}`;
      success = await sendOTP(formatted);
    }

    if (success) {
      navigation.navigate('OTP', {
        email: isEmail ? trimmed : '',
        phone: isEmail ? '' : trimmed,
        mode: 'reset',
      });
    }
  };

  return (
    <SafeAreaContextView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>🔒</Text>
          </View>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter the email or mobile number linked to your account. We'll send a verification code to reset your password.
          </Text>

          <Input
            label="Email or Mobile Number"
            placeholder="e.g., user@example.com or 9876543210"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setLocalError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={localError || undefined}
            required
          />

          <Button
            title="Send Reset Code"
            onPress={handleSendReset}
            loading={isLoading}
            style={styles.submitBtn}
          />

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backToLoginText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaContextView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    ...shadows.button,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  backToLogin: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: colors.textLink,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
