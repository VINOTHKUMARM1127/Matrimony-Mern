/**
 * Wedring Matrimony — AdminDashboard Screen
 * Overview analytics and quick actions for application administrators
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const AdminDashboard = ({ navigation }) => {
  const stats = [
    { label: 'Total Users', value: '45,210', change: '+12% this week', emoji: '👥' },
    { label: 'Premium Subscriptions', value: '8,421', change: '+8% this week', emoji: '👑' },
    { label: 'Active Today', value: '18,500', change: '62% active rate', emoji: '🟢' },
    { label: 'Pending Reports', value: '14', change: 'Require review', emoji: '⚠️' },
  ];

  const actions = [
    { title: 'Manage Users', desc: 'Verify, block, or search user base', screen: 'UserManagement', emoji: '⚙️' },
    { title: 'Pending Reports', desc: 'Inspect reported profiles and actions', screen: 'ReportManagement', emoji: '🚨' },
    { title: 'Detailed Analytics', desc: 'Growth, subscriptions, and matches charts', screen: 'AnalyticsScreen', emoji: '📈' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Control Center</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Stats Grid */}
        <View style={styles.grid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={styles.statHeader}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </View>
          ))}
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Operations</Text>

        {/* Actions list */}
        <View style={styles.actionsList}>
          {actions.map((act, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionItem}
              onPress={() => navigation.navigate(act.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.actionEmojiBg}>
                <Text style={styles.actionEmoji}>{act.emoji}</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{act.title}</Text>
                <Text style={styles.actionDesc}>{act.desc}</Text>
              </View>
              <Text style={styles.chevron}>➔</Text>
            </TouchableOpacity>
          ))}
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statEmoji: {
    fontSize: 14,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  statChange: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionEmojiBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionContent: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default AdminDashboard;
