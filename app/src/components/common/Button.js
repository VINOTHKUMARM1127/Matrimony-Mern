/**
 * Wedring Matrimony — Button Component
 * Premium reusable button with variants
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, palette } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';

// Filled variants render a subtle two-stop gradient for a premium feel.
const GRADIENTS = {
  primary: [colors.gradientPrimaryStart, colors.gradientPrimaryEnd],
  secondary: [colors.secondary, colors.secondaryDark],
  danger: [palette.red500, palette.red600],
};

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'medium', // small | medium | large
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
  ...props
}) => {
  const gradientColors = !disabled ? GRADIENTS[variant] : null;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    gradientColors ? shadows.buttonFloat : shadows.button,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const inner = loading ? (
    <ActivityIndicator
      color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse}
      size="small"
    />
  ) : (
    <View style={styles.content}>
      {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
      <Text style={textStyles}>{title}</Text>
      {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={buttonStyles}
      {...props}
    >
      {gradientColors && (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {inner}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },

  // Sizes
  size_small: {
    height: layout.buttonHeightSmall,
    paddingHorizontal: 16,
  },
  size_medium: {
    height: layout.buttonHeight,
    paddingHorizontal: 24,
  },
  size_large: {
    height: 56,
    paddingHorizontal: 32,
  },

  // Text
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  text_primary: {
    color: colors.textInverse,
  },
  text_secondary: {
    color: colors.textInverse,
  },
  text_outline: {
    color: colors.primary,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_danger: {
    color: colors.textInverse,
  },

  // Text Sizes
  textSize_small: {
    fontSize: 13,
  },
  textSize_medium: {
    fontSize: 15,
  },
  textSize_large: {
    fontSize: 17,
  },

  // Disabled
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default React.memo(Button);
