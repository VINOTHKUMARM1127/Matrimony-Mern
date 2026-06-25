/**
 * Wedring Matrimony — Avatar Component
 * Profile photo display with fallback initials
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme';
import { layout } from '../../theme/spacing';

const SIZES = {
  small: layout.avatarSmall,
  medium: layout.avatarMedium,
  large: layout.avatarLarge,
  xlarge: layout.avatarXLarge,
};

const Avatar = ({
  source,
  name = '',
  size = 'medium',
  showOnline = false,
  isOnline = false,
  showVerified = false,
  style,
}) => {
  const dimension = typeof size === 'number' ? size : SIZES[size] || SIZES.medium;
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fontSize = dimension * 0.35;

  return (
    <View style={[styles.container, { width: dimension, height: dimension }, style]}>
      {source ? (
        <Image
          source={typeof source === 'string' ? { uri: source } : source}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
          contentFit="cover"
          placeholder="LKO2?U%2Tw=w]~RBVZRi};RPxuwH" // Generic profile blurhash
          placeholderContentFit="cover"
          transition={{ effect: 'cross-dissolve', duration: 400 }}
          cachePolicy="memory-disk" // Ensure images are aggressively cached
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials || '?'}</Text>
        </View>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineIndicator,
            { backgroundColor: isOnline ? colors.online : colors.offline },
            dimension > 50 && styles.onlineIndicatorLarge,
          ]}
        />
      )}

      {showVerified && (
        <View style={[styles.verifiedBadge, dimension > 50 && styles.verifiedBadgeLarge]}>
          <Text style={styles.verifiedIcon}>✓</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.surface,
  },
  fallback: {
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.background,
  },
  onlineIndicatorLarge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.verified,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  verifiedBadgeLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  verifiedIcon: {
    color: colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default React.memo(Avatar);
