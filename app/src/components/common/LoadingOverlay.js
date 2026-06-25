/**
 * Wedring Matrimony — Loading Overlay Component
 * Full-screen loading indicator
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const LoadingOverlay = ({
  visible = false,
  message = 'Loading...',
  transparent = true,
}) => {
  if (!visible) return null;

  if (transparent) {
    return (
      <Modal transparent visible={visible} statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <ActivityIndicator size="large" color={colors.primary} />
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    padding: 32,
    alignItems: 'center',
    minWidth: 140,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default React.memo(LoadingOverlay);
