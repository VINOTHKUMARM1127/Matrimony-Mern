/**
 * Wedring Matrimony — Splash Screen
 * Animated brand splash with auto-login check
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import useAuthStore from '../../store/useAuthStore';

const SplashScreen = ({ navigation }) => {
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    // Animate logo
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize auth
    initialize();

    // Set a timeout to show a retry button if the app gets stuck
    const timeout = setTimeout(() => {
      setShowRetry(true);
    }, 8000); // 8 seconds

    return () => clearTimeout(timeout);
  }, []);

  const handleRetry = () => {
    setShowRetry(false);
    initialize();
    
    // Set a new timeout
    setTimeout(() => {
      setShowRetry(true);
    }, 8000);
  };

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        // Navigation will be handled by AppNavigator based on auth state
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🪷</Text>
        </View>
        <Text style={styles.appName}>Wedring Matrimony</Text>
      </Animated.View>

      <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
        <Text style={styles.tagline}>Find Your Perfect Match</Text>
        <Text style={styles.taglineTamil}>உங்கள் சரியான வாழ்க்கைத் துணையை கண்டறியுங்கள்</Text>
      </Animated.View>

      <View style={styles.footer}>
        {showRetry ? (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Connection slow. Tap to retry</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loader}>
            <View style={styles.loaderDot} />
            <View style={[styles.loaderDot, styles.loaderDotDelay1]} />
            <View style={[styles.loaderDot, styles.loaderDotDelay2]} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  taglineContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  taglineTamil: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  loader: {
    flexDirection: 'row',
    gap: 8,
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  loaderDotDelay1: {
    opacity: 0.4,
  },
  loaderDotDelay2: {
    opacity: 0.2,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SplashScreen;
