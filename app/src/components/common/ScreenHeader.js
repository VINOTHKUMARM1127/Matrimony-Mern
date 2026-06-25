/**
 * Wedring Matrimony — ScreenHeader
 * Consistent, premium screen header used across the app.
 *
 *   <ScreenHeader title="Notifications" subtitle="You're all caught up" />
 *   <ScreenHeader title="Edit Profile" onBack={() => nav.goBack()} rightIcon="check" onRightPress={save} />
 *
 * Pure presentation; no data/nav assumptions. Safe to drop into any screen.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { layout } from '../../theme/spacing';
import Icon from './Icon';

const ScreenHeader = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  rightBadge = false,
  style,
  children,
}) => {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="chevronLeft" size={22} color={colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacerLeft} />
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        {rightIcon ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onRightPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name={rightIcon} size={20} color={colors.textPrimary} strokeWidth={2} />
            {rightBadge && <View style={styles.badge} />}
          </TouchableOpacity>
        ) : (
          <View style={styles.spacerRight} />
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surfacePressed,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacerLeft: { width: 0 },
  spacerRight: { width: 42, height: 42 },
  badge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.surfacePressed,
  },
});

export default React.memo(ScreenHeader);
