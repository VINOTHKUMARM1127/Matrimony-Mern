/**
 * Wedring Matrimony — Reset Password Screen
 * Allows user to set a new password after OTP verification.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { SafeAreaView as SafeAreaContextView } from 'react-native-safe-area-context';
import { colors, borderRadius, shadows } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import apiClient from '../../api/apiClient';

const PASSWORD_MIN_LENGTH = 8;

const ResetPasswordScreen = ({ route, navigation }) => {
  const email = route.params?.email || '';
  const phone = route.params?.phone || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = {
    length: password.length >= PASSWORD_MIN_LENGTH,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isPasswordValid = passwordChecks.length && passwordChecks.letter && passwordChecks.number;

  const validate = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'New password is required.';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password must be 8+ characters with at least 1 letter and 1 number.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      try {
        await apiClient.post('/auth/reset-password', { password });
      } catch (err) {
        if (!__DEV__) throw err; // Ignore mock errors in dev
      }

      Alert.alert(
        'Password Updated',
        'Your password has been reset successfully. Please sign in with your new password.',
        [
          {
            text: 'Go to Sign In',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error) {
      if (__DEV__) {
        console.warn('[ResetPassword] Dev mode — simulating success:', error.message);
        Alert.alert(
          'Password Updated (Dev)',
          'Password reset simulated in development mode.',
          [
            {
              text: 'Go to Sign In',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      } else {
        setErrors({ password: error.message || 'Failed to update password.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaContextView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>🔑</Text>
          </View>

          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Create a strong password for your account
            {email ? ` (${email})` : phone ? ` (${phone})` : ''}.
          </Text>

          <Input
            label="New Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            error={errors.password}
            required
          />

          {/* Password strength indicators */}
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <PasswordCheck label="8+ characters" passed={passwordChecks.length} />
              <PasswordCheck label="Contains a letter" passed={passwordChecks.letter} />
              <PasswordCheck label="Contains a number" passed={passwordChecks.number} />
            </View>
          )}

          <Input
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            secureTextEntry
            error={errors.confirmPassword}
            required
          />

          <Button
            title="Reset Password"
            onPress={handleReset}
            loading={isLoading}
            style={styles.submitBtn}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaContextView>
  );
};

const PasswordCheck = ({ label, passed }) => (
  <View style={styles.checkRow}>
    <Text style={[styles.checkIcon, passed && styles.checkIconPassed]}>
      {passed ? '✓' : '○'}
    </Text>
    <Text style={[styles.checkLabel, passed && styles.checkLabelPassed]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 50,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.goldSurface,
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
  strengthContainer: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 8,
    width: 16,
  },
  checkIconPassed: {
    color: colors.success,
  },
  checkLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  checkLabelPassed: {
    color: colors.success,
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default ResetPasswordScreen;
