/**
 * Wedring Matrimony — SectionHeader
 * Small uppercase section label with optional icon + trailing action.
 *
 *   <SectionHeader title="Account" />
 *   <SectionHeader title="Photos" icon="camera" actionLabel="Edit" onAction={...} />
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { layout } from '../../theme/spacing';
import Icon from './Icon';

const SectionHeader = ({ title, icon, actionLabel, onAction, style }) => (
  <View style={[styles.row, style]}>
    <View style={styles.left}>
      {icon ? <Icon name={icon} size={14} color={colors.textMuted} strokeWidth={2.2} /> : null}
      <Text style={styles.title}>{title}</Text>
    </View>
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: 24,
    marginBottom: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default React.memo(SectionHeader);
