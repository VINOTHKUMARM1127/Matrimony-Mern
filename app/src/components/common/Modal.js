/**
 * Wedring Matrimony — Modal Component
 * Reusable modal with backdrop animation
 */
import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import shadows from '../../theme/shadows';

const Modal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  size = 'medium', // small | medium | large | fullscreen
  style,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback
          onPress={closeOnBackdrop ? onClose : undefined}
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.container, styles[`size_${size}`], style]}>
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <Text style={styles.title}>{title || ''}</Text>
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    maxHeight: '85%',
    ...shadows.modal,
  },
  size_small: {
    width: '75%',
  },
  size_medium: {
    width: '85%',
  },
  size_large: {
    width: '92%',
  },
  size_fullscreen: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default React.memo(Modal);
