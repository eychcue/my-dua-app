// File: components/CustomScrollableView.tsx

import React, { useCallback } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type CustomScrollableViewProps = {
  children: React.ReactNode[];
  onIndexChange: (index: number) => void;
  initialIndex: number;
};

export default function CustomScrollableView({ children, onIndexChange, initialIndex }: CustomScrollableViewProps) {
  const translateY = useSharedValue(-initialIndex * SCREEN_HEIGHT);
  const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * (children.length - 1);

  const clamp = (value: number, min: number, max: number) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
  };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newY = ctx.startY + event.translationY;
      translateY.value = clamp(newY, MAX_TRANSLATE_Y, 0);
    },
    onEnd: (event) => {
      const velocity = event.velocityY;
      const projectedEndpoint = translateY.value + velocity * 0.2;
      let targetPage = Math.round(-projectedEndpoint / SCREEN_HEIGHT);
      targetPage = clamp(targetPage, 0, children.length - 1);
      const snapPoint = -targetPage * SCREEN_HEIGHT;
      translateY.value = withSpring(snapPoint, {
        velocity: velocity,
        damping: 20,
        stiffness: 200,
      });
      runOnJS(onIndexChange)(targetPage);
    },
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, rStyle]}>{children}</Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
