/**
 * Wedring Matrimony — FeatureList Component
 * Detailed side-by-side comparison of Free and Premium benefits
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const COMPARISON_ITEMS = [
  { feature: 'View Unlimited Profiles', free: '✓', premium: '✓' },
  { feature: 'Send Interest Requests', free: '✓', premium: '✓' },
  { feature: 'Direct Chat with Matches', free: '❌', premium: '✓' },
  { feature: 'View Contact Details', free: '❌', premium: '✓' },
  { feature: '10-Porutham Horoscope Compatibility Check', free: '❌', premium: '✓' },
  { feature: 'Access Premium-Only Matches', free: '❌', premium: '✓' },
  { feature: 'Profile Boost to Top of Searches', free: '❌', premium: '✓' },
  { feature: 'Browse Secret (Private) Profiles', free: '❌', premium: '✓' },
];

const FeatureList = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Comparison</Text>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.featureCol]}>Feature</Text>
        <Text style={[styles.headerCell, styles.checkCol]}>Free</Text>
        <Text style={[styles.headerCell, styles.checkCol, styles.premiumHeader]}>Premium</Text>
      </View>

      {/* Rows */}
      {COMPARISON_ITEMS.map((item, idx) => (
        <View 
          key={idx} 
          style={[
            styles.row, 
            idx % 2 === 1 ? styles.rowAlt : null
          ]}
        >
          <Text style={[styles.cell, styles.featureCol]}>{item.feature}</Text>
          <Text style={[
            styles.cell, 
            styles.checkCol, 
            item.free === '❌' ? styles.crossText : styles.checkText
          ]}>
            {item.free}
          </Text>
          <Text style={[
            styles.cell, 
            styles.checkCol, 
            styles.premiumCell,
            styles.checkText
          ]}>
            {item.premium}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowAlt: {
    backgroundColor: colors.surface,
  },
  cell: {
    fontSize: 12,
    color: colors.text,
  },
  featureCol: {
    flex: 2,
    paddingHorizontal: 12,
    textAlign: 'left',
    fontWeight: '500',
  },
  checkCol: {
    flex: 1,
    textAlign: 'center',
  },
  premiumHeader: {
    color: colors.primary,
  },
  premiumCell: {
    fontWeight: '700',
  },
  checkText: {
    color: colors.success,
    fontSize: 14,
  },
  crossText: {
    color: colors.error,
    fontSize: 10,
  },
});

export default FeatureList;
