/**
 * Wedring Matrimony — CompatibilityBadge Component
 * Displays match compatibility score based on Tamil star matching and preference rules
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const CompatibilityBadge = ({ score, onPress, size = 'medium' }) => {
  if (score === undefined || score === null) return null;

  const isSmall = size === 'small';
  
  // Get color based on compatibility score
  const getScoreColor = (val) => {
    if (val >= 80) return colors.success;
    if (val >= 60) return colors.primary;
    return colors.secondary;
  };

  const badgeColor = getScoreColor(score);

  if (isSmall) {
    return (
      <View style={[styles.smallBadge, { backgroundColor: badgeColor }]}>
        <Text style={styles.smallText}>{score}% Match</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: badgeColor }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.circle, { backgroundColor: badgeColor }]}>
        <Text style={styles.percentText}>{score}%</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: badgeColor }]}>Compatibility</Text>
        <Text style={styles.subLabel}>Based on 10 Poruthams</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: 8,
    alignSelf: 'flex-start',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  textContainer: {
    marginLeft: 10,
    marginRight: 6,
  },
  label: {
    fontWeight: '700',
    fontSize: 13,
  },
  subLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  smallText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
});

export default CompatibilityBadge;
