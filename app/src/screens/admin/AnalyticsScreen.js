/**
 * Wedring Matrimony — AnalyticsScreen Component
 * Mock stats and system reporting visualizations for administrators
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const AnalyticsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Analytics</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Metric Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Registration Growth</Text>
          <Text style={styles.sub}>Total users increased by 14% over the last month.</Text>
          <View style={styles.graphContainer}>
            {/* Visual Bar Graph */}
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 40 }]} />
              <Text style={styles.label}>Feb</Text>
            </View>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 60 }]} />
              <Text style={styles.label}>Mar</Text>
            </View>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 90 }]} />
              <Text style={styles.label}>Apr</Text>
            </View>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 130 }]} />
              <Text style={styles.label}>May</Text>
            </View>
          </View>
        </View>

        {/* Gender Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gender Distribution</Text>
          <View style={styles.distRow}>
            <View style={styles.distCol}>
              <Text style={styles.distVal}>58%</Text>
              <Text style={styles.distLabel}>Male Users</Text>
            </View>
            <View style={styles.distCol}>
              <Text style={styles.distVal}>42%</Text>
              <Text style={styles.distLabel}>Female Users</Text>
            </View>
          </View>
        </View>

        {/* Premium Transaction log */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Upgrades</Text>
          <View style={styles.transaction}>
            <Text style={styles.txText}>Upgrade to Gold - TM-9830A</Text>
            <Text style={styles.txPrice}>₹999</Text>
          </View>
          <View style={styles.transaction}>
            <Text style={styles.txText}>Upgrade to Prime Gold - TM-2349B</Text>
            <Text style={styles.txPrice}>₹1,999</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    paddingRight: 16,
  },
  backText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 160,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
  },
  barCol: {
    alignItems: 'center',
    width: 40,
  },
  bar: {
    width: 24,
    backgroundColor: colors.primary,
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  distRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-around',
  },
  distCol: {
    alignItems: 'center',
  },
  distVal: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.secondary,
  },
  distLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  txText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  txPrice: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
  },
});

export default AnalyticsScreen;
