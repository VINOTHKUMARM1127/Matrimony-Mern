/**
 * Wedring Matrimony — Registration StepIndicator
 * Premium onboarding progress: node dots with lucide icons, animated fill bar,
 * current-step title + count. Same API: <StepIndicator currentStep={0} totalSteps={8} />
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../../theme';
import { layout } from '../../theme/spacing';
import Icon from '../common/Icon';

const STEPS = [
  { label: 'Basic Details', icon: 'user' },
  { label: 'Religion & Caste', icon: 'sparkles' },
  { label: 'Education & Career', icon: 'education' },
  { label: 'Family', icon: 'users' },
  { label: 'Horoscope', icon: 'star' },
  { label: 'Lifestyle', icon: 'food' },
  { label: 'Photos', icon: 'camera' },
  { label: 'Partner Preferences', icon: 'heart' },
];

const StepIndicator = ({ currentStep = 0, totalSteps = STEPS.length }) => {
  const count = Math.max(totalSteps, STEPS.length ? STEPS.length : totalSteps);
  const steps = STEPS.slice(0, totalSteps);
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const fill = useSharedValue(0);
  useEffect(() => {
    fill.value = withTiming(progress, { duration: 450, easing: Easing.out(Easing.cubic) });
  }, [progress]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  const current = steps[currentStep] || { label: `Step ${currentStep + 1}`, icon: 'edit' };

  return (
    <View style={styles.container}>
      {/* Node dots */}
      <View style={styles.nodesRow}>
        {steps.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <React.Fragment key={s.label}>
              <View
                style={[
                  styles.node,
                  done && styles.nodeDone,
                  active && styles.nodeActive,
                ]}
              >
                {done ? (
                  <Icon name="check" size={12} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Icon
                    name={s.icon}
                    size={12}
                    color={active ? '#FFFFFF' : colors.textMuted}
                    strokeWidth={2.2}
                  />
                )}
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.connector, i < currentStep && styles.connectorDone]} />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Animated progress bar */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, fillStyle]} />
      </View>

      {/* Current step info */}
      <View style={styles.stepInfo}>
        <View style={styles.stepLabel}>
          <View style={styles.stepBadge}>
            <Icon name={current.icon} size={14} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.stepText}>{current.label}</Text>
        </View>
        <Text style={styles.stepCount}>
          Step {currentStep + 1} of {totalSteps}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.background,
  },
  nodesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfacePressed,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  nodeDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  nodeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
    marginHorizontal: 3,
    borderRadius: 1,
  },
  connectorDone: {
    backgroundColor: colors.success,
  },
  progressBar: {
    height: 5,
    backgroundColor: colors.surfacePressed,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stepLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  stepCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});

export default React.memo(StepIndicator);
