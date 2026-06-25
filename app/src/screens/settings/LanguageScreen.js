import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';

const LanguageScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language / மொழி</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={[styles.langOption, styles.langActive]}>
          <Text style={[styles.langText, styles.langTextActive]}>English</Text>
          <Text style={styles.check}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.langOption}>
          <Text style={styles.langText}>தமிழ் (Tamil)</Text>
        </TouchableOpacity>
        <Text style={styles.note}>More languages coming soon.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: layout.screenPaddingHorizontal,
    marginTop: 16,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  langActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  langText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  langTextActive: {
    color: colors.primary,
  },
  check: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  note: {
    marginTop: 24,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LanguageScreen;
