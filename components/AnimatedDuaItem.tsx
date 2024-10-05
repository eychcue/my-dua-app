// File: components/AnimatedDuaItem.tsx

import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import DuaDetails from './DuaDetails';
import { Dua } from '@/types/dua';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  dua: Dua;
  index: number;
  scrollY: Animated.SharedValue<number>;
};

export default function AnimatedDuaItem({ dua, index, scrollY }: Props) {
  const inputRange = [
    (index - 1) * SCREEN_HEIGHT,
    index * SCREEN_HEIGHT,
    (index + 1) * SCREEN_HEIGHT,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.duaContainer, animatedStyle]}>
      <DuaDetails dua={dua} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  duaContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
