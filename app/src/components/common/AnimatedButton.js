import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * AnimatedButton
 * A high-end button component that smoothly scales down when pressed
 * and springs back up when released, providing premium haptic-like visual feedback.
 */
const AnimatedButton = ({
  onPress,
  children,
  style,
  disabled = false,
  scaleDownTo = 0.95,
  ...props
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(scaleDownTo, {
      damping: 10,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 400,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.6 : 1,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[style, animatedStyle]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};

export default React.memo(AnimatedButton);
