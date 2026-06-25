/**
 * Wedring Matrimony — VerificationBadge Component
 * Premium badge indicating verified profile status
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const VerificationBadge = ({ showText = false, size = 'medium' }) => {
  const isSmall = size === 'small';
  
  return (
    <View style={[
      styles.container,
      showText ? styles.row : styles.badgeOnly,
      isSmall ? styles.small : styles.medium
    ]}>
      <Text style={[styles.checkmark, isSmall ? styles.checkmarkSmall : styles.checkmarkMedium]}>✓</Text>
      {showText && (
        <Text style={[styles.text, isSmall ? styles.textSmall : styles.textMedium]}>
          Verified Profile
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOnly: {
    borderRadius: 999,
  },
  row: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  small: {
    width: 18,
    height: 18,
  },
  medium: {
    width: 24,
    height: 24,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkmarkSmall: {
    fontSize: 10,
    lineHeight: 12,
  },
  checkmarkMedium: {
    fontSize: 14,
    lineHeight: 18,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
});

export default VerificationBadge;
