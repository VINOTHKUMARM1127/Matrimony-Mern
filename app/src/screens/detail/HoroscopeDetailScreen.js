/**
 * Wedring Matrimony — HoroscopeDetailScreen Component
 * Displays traditional 10-Porutham horoscope matching details
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import { calculateStarCompatibility } from '../../utils/starCompatibility';

const HoroscopeDetailScreen = ({ route, navigation }) => {
  const { boyStar, girlStar, boyName = 'Boy', girlName = 'Girl' } = route.params || {};

  const compatibility = useMemo(() => {
    return calculateStarCompatibility(boyStar, girlStar);
  }, [boyStar, girlStar]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>10-Porutham Analysis</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Comparison card */}
        <View style={styles.versusCard}>
          <View style={styles.avatarCol}>
            <View style={styles.avatarIcon}><Text style={styles.emoji}>👨</Text></View>
            <Text style={styles.name}>{boyName}</Text>
            <Text style={styles.starText}>{boyStar || 'Not Specified'}</Text>
          </View>
          <View style={styles.scoreCol}>
            <Text style={styles.scorePercent}>{compatibility.percentage}%</Text>
            <Text style={styles.scoreCount}>{compatibility.total} / 10</Text>
            <Text style={styles.verdictText}>Verdict: {compatibility.verdict}</Text>
          </View>
          <View style={styles.avatarCol}>
            <View style={styles.avatarIcon}><Text style={styles.emoji}>👩</Text></View>
            <Text style={styles.name}>{girlName}</Text>
            <Text style={styles.starText}>{girlStar || 'Not Specified'}</Text>
          </View>
        </View>

        {/* Detailed checks list */}
        <View style={styles.detailsList}>
          <Text style={styles.sectionTitle}>Matching Poruthams</Text>
          
          {compatibility.details.map((check, idx) => (
            <View key={idx} style={styles.checkRow}>
              <View style={styles.checkHeader}>
                <View style={[
                  styles.statusCircle,
                  check.matched ? styles.statusMatched : styles.statusUnmatched
                ]}>
                  <Text style={styles.statusText}>{check.matched ? '✓' : '✕'}</Text>
                </View>
                <View style={styles.checkTextCol}>
                  <Text style={styles.checkName}>{check.name}</Text>
                  <Text style={styles.checkDesc}>{check.description}</Text>
                </View>
              </View>
            </View>
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
  versusCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  avatarCol: {
    alignItems: 'center',
    flex: 1,
  },
  avatarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  starText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreCol: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  scorePercent: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  verdictText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    backgroundColor: 'rgba(0, 139, 139, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginTop: 6,
  },
  detailsList: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  checkRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusMatched: {
    backgroundColor: colors.success,
  },
  statusUnmatched: {
    backgroundColor: colors.error,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  checkTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  checkName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  checkDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default HoroscopeDetailScreen;
