import { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { triggerVibration } from '../constant/vibration';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MotionPressable = ({ children, className, onPress, onPressIn = undefined, onPressOut = undefined, haptic = 'impact-light', style = undefined, ...props }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      friction: 8,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...props}
      className={className}
      style={[style, { transform: [{ scale }] }]}
      onPressIn={(event) => {
        animateTo(0.97);
        if (haptic) triggerVibration(haptic);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
};

export default MotionPressable;
