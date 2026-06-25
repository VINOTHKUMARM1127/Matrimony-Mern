/**
 * Wedring Matrimony — Card Component
 * Elegant rounded card with variants
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import shadows from '../../theme/shadows';

const Card = ({
  children,
  onPress,
  variant = 'elevated', // elevated | outlined | flat | gold | soft
  padding = 16,
  style,
  ...props
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={cardStyles}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.cardFloat,
  },
  soft: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.cardSoft,
  },
  outlined: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.surface,
  },
  gold: {
    backgroundColor: colors.goldLight,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    ...shadows.cardSoft,
  },
});

export default React.memo(Card);
