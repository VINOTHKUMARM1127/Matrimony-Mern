/**
 * Wedring Matrimony — Premium Login Screen
 * Vanakkam! Clean, modern login supporting both credentials & OTP flows.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { SafeAreaView as SafeAreaContextView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, layout, shadows } from '../../theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import useAuthStore from '../../store/useAuthStore';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(''); // Email or Mobile Number
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const {
    signInWithPassword,
    sendOTP,
    sendEmailOTP,
    isLoading,
    error,
    clearError,
    pendingVerification,
    clearPendingVerification,
  } = useAuthStore();

  // Sync global error store to local error
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Handle unverified email redirection
  useEffect(() => {
    if (pendingVerification) {
      const identifier = pendingVerification;
      clearPendingVerification(); // Clear it so we don't loop
      
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      
      // Automatically trigger a new OTP
      if (isEmail) {
        sendEmailOTP(identifier);
      } else {
        sendOTP(identifier);
      }

      navigation.navigate('OTP', {
        email: isEmail ? identifier : '',
        phone: isEmail ? '' : identifier,
        mode: 'signup', // We treat it like signup verification
      });
    }
  }, [pendingVerification]);

  const validateInput = () => {
    setLocalError('');
    clearError();

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setLocalError('Please enter your email or mobile number');
      return false;
    }

    return true;
  };

  const handleOTPLogin = async () => {
    if (!validateInput()) return;

    const trimmedIdentifier = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);

    // OTP Flow
    let success = false;
    if (isEmail) {
      success = await sendEmailOTP(trimmedIdentifier);
    } else {
      // Format mobile - strip non-digits
      const cleanedPhone = trimmedIdentifier.replace(/[^0-9]/g, '');
      if (cleanedPhone.length < 10) {
        setLocalError('Please enter a valid 10-digit mobile number');
        return;
      }
      const formattedPhone = cleanedPhone.startsWith('91') && cleanedPhone.length > 10 
        ? `+${cleanedPhone}` 
        : `+91${cleanedPhone.slice(-10)}`;
      
      success = await sendOTP(formattedPhone);
    }

    if (success) {
      navigation.navigate('OTP', {
        email: isEmail ? trimmedIdentifier : '',
        phone: isEmail ? '' : trimmedIdentifier,
        mode: 'login',
      });
    }
  };

  const handlePasswordLogin = async () => {
    if (!validateInput()) return;
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    const trimmedIdentifier = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);
    
    let formattedIdentifier = trimmedIdentifier;
    if (!isEmail) {
      const cleanedPhone = trimmedIdentifier.replace(/[^0-9]/g, '');
      if (cleanedPhone.length < 10) {
        setLocalError('Please enter a valid 10-digit mobile number');
        return;
      }
      formattedIdentifier = cleanedPhone.startsWith('91') && cleanedPhone.length > 10 
        ? `+${cleanedPhone}` 
        : `+91${cleanedPhone.slice(-10)}`;
    }

    await signInWithPassword(formattedIdentifier, password);
  };





  return (
    <SafeAreaContextView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header section with brand accent */}
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Icon name="heart" size={30} color="#FFFFFF" fill="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.greeting}>Vanakkam</Text>
            <Text style={styles.title}>Wedring Matrimony</Text>
            <Text style={styles.subtitle}>Find your perfect life partner</Text>
          </View>



          {/* Input fields */}
          <View style={styles.form}>
            <Input
              label="Email or Mobile Number"
              placeholder="e.g., tamiluser@example.com or 9876543210"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setLocalError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />



            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setLocalError('');
              }}
              secureTextEntry
              required
            />

            <View style={styles.forgotContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Error display */}
            {localError ? (
              <View style={styles.errorContainer}>
                <Icon name="alert" size={16} color={colors.error} />
                <Text style={styles.errorText}>{localError}</Text>
              </View>
            ) : null}



            {/* Submit button */}
            <Button
              title="Login"
              onPress={handlePasswordLogin}
              loading={isLoading}
              style={styles.submitBtn}
            />

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.createAccountRow}>
              <Text style={styles.createAccountText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                <Text style={styles.createAccountLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service & Privacy Policy.
            </Text>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    ...shadows.buttonFloat,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.background,
    ...shadows.bottomNav,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  form: {
    flex: 1,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: colors.textLink,
    fontWeight: '600',
    fontSize: 13,
  },
  submitBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  otpBtn: {
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorLight,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: borderRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  },

  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  createAccountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  createAccountText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  createAccountLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default LoginScreen;
