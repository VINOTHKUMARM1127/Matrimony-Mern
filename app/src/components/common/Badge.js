/**
 * Wedring Matrimony — Badge Component
 * Status badges, tags, and labels
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const Badge = ({
  label,
  variant = 'default', // default | primary | secondary | success | warning | error | premium | outline
  size = 'medium', // small | medium | large
  icon = null,
  style,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[`size_${size}`], style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },

  // Sizes
  size_small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  size_medium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  size_large: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },

  // Variants
  default: {
    backgroundColor: colors.surface,
  },
  primary: {
    backgroundColor: colors.primarySurface,
  },
  secondary: {
    backgroundColor: colors.secondarySurface,
  },
  success: {
    backgroundColor: colors.successLight,
  },
  warning: {
    backgroundColor: colors.warningLight,
  },
  error: {
    backgroundColor: colors.errorLight,
  },
  premium: {
    backgroundColor: colors.goldLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Text
  text: {
    fontWeight: '500',
  },
  text_default: { color: colors.textSecondary },
  text_primary: { color: colors.primary },
  text_secondary: { color: colors.secondary },
  text_success: { color: colors.success },
  text_warning: { color: colors.warning },
  text_error: { color: colors.error },
  text_premium: { color: colors.goldDark },
  text_outline: { color: colors.textSecondary },

  textSize_small: { fontSize: 10 },
  textSize_medium: { fontSize: 12 },
  textSize_large: { fontSize: 14 },
});

export default React.memo(Badge);
