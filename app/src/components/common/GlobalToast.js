import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react-native';
import useToastStore from '../../store/useToastStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';

const { width } = Dimensions.get('window');

const GlobalToast = () => {
  const { toast, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: insets.top > 0 ? insets.top + 10 : 20,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          closeToast();
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -150,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast]);

  const closeToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!toast) return null;

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: colors.success + '15',
          border: colors.success,
          icon: <CheckCircle2 size={24} color={colors.success} />,
        };
      case 'error':
        return {
          bg: colors.error + '15',
          border: colors.error,
          icon: <XCircle size={24} color={colors.error} />,
        };
      case 'warning':
        return {
          bg: colors.warning + '15',
          border: colors.warning,
          icon: <AlertCircle size={24} color={colors.warning} />,
        };
      case 'info':
      default:
        return {
          bg: colors.primary + '15',
          border: colors.primary,
          icon: <Info size={24} color={colors.primary} />,
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: '#FFFFFF',
          borderLeftColor: config.border,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
          {config.icon}
        </View>
        <View style={styles.textContainer}>
          {toast.title && <Text style={styles.title}>{toast.title}</Text>}
          <Text style={styles.message}>{toast.message}</Text>
        </View>
        <TouchableOpacity onPress={closeToast} style={styles.closeBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <X size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    width: width - 40,
    zIndex: 999999,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...shadows.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    ...typography.subtitle2,
    color: colors.text.primary,
    marginBottom: 4,
  },
  message: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  closeBtn: {
    padding: 4,
  },
});

export default GlobalToast;
