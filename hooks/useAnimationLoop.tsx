import React from "react";
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/**
 * You must use loop.value inside a useDerivedValue to ensure the loop runs.
 */
export default function useAnimationLoop(enabled: boolean = true) {
  // Loop is only used to force the duration useDerivedValue to update and get calculate the value
  // based off the Date.now() and the endDate. This means we don't have ensure our withTiming call
  // is exactly right and still works when the user closes the app and reopens it. A timer only
  // cares about it's end date, not the exact timing of the animation. This is much more accurate
  // and reliable than using withTiming directly on the duration.
  const loop = useSharedValue<number | null>(0);

  React.useEffect(() => {
    if (!enabled) {
      cancelAnimation(loop);
      loop.value = null;
    } else {
      loop.value = 0;

      loop.value = withRepeat(
        withTiming(0, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1, // Infinite loop
        false // Do not reverse
      );
    }
  }, [enabled, loop]);

  return loop;
}
