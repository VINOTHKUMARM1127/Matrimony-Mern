/**
 * Wedring Matrimony — SuccessOverlay
 * A reusable, premium confirmation animation for key moments:
 * Interest Sent, Contact Unlocked, Premium Activated, Profile Saved, etc.
 *
 * Built on react-native-reanimated. A circular badge springs in, the icon
 * pops, a title/subtitle fade up, and the whole thing auto-dismisses.
 *
 * Usage:
 *   const [show, setShow] = useState(false);
 *   <SuccessOverlay visible={show} icon="heart" title="Interest Sent!"
 *                   subtitle="We'll let you know when they respond"
 *                   onDone={() => setShow(false)} />
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay,
  withSequence, runOnJS, Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme';
import Icon from './Icon';

const SuccessOverlay = ({
  visible,
  icon = 'check',
  title = 'Success',
  subtitle,
  tint = colors.success,
  duration = 1600,
  onDone,
}) => {
  const backdrop = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const textY = useSharedValue(12);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 180 });
      badgeScale.value = withSpring(1, { damping: 11, stiffness: 180 });
      iconScale.value = withDelay(120, withSpring(1, { damping: 9, stiffness: 220 }));
      textOpacity.value = withDelay(220, withTiming(1, { duration: 260 }));
      textY.value = withDelay(220, withSpring(0, { damping: 14, stiffness: 160 }));

      // Auto-dismiss
      backdrop.value = withDelay(
        duration,
        withTiming(0, { duration: 220, easing: Easing.out(Easing.ease) }, (finished) => {
          if (finished && onDone) runOnJS(onDone)();
        })
      );
    } else {
      backdrop.value = 0;
      badgeScale.value = 0;
      iconScale.value = 0;
      textY.value = 12;
      textOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value, transform: [{ translateY: textY.value }] }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <View style={styles.card}>
          <Animated.View style={[styles.badge, { backgroundColor: tint + '18' }, badgeStyle]}>
            <Animated.View style={iconStyle}>
              <Icon name={icon} size={40} color={tint} fill={icon === 'heart' ? tint : 'none'} />
            </Animated.View>
          </Animated.View>
          <Animated.View style={textStyle}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 36,
    alignItems: 'center',
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  badge: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 19, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 13.5, color: colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 19 },
});

export default React.memo(SuccessOverlay);
