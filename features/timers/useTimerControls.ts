import React from "react";
import {
  cancelAnimation,
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { TimerControls, TimerState } from "./types";

export interface UseTimerControlsProps {
  seconds: number | null; // The duration in seconds, or null for a default example duration
  onStart?: () => void; // Optional callback when the timer starts
}

export default function useTimerControls(
  props: UseTimerControlsProps
): TimerControls {
  const { seconds, onStart } = props;

  const state = useSharedValue<TimerState>({ type: "stopped" });

  // Loop is only used to force the duration useDerivedValue to update and get calculate the value
  // based off the Date.now() and the endDate. This means we don't have ensure our withTiming call
  // is exactly right and still works when the user closes the app and reopens it. A timer only
  // cares about it's end date, not the exact timing of the animation. This is much more accurate
  // and reliable than using withTiming directly on the duration.
  const loop = useSharedValue<number | null>(0);

  const duration = useDerivedValue<number | null>(() => {
    if (state.value.type === "paused") {
      return state.value.secondsLeft;
    }

    if (state.value.type === "running") {
      return (state.value.endDate - Date.now()) / 1000;
    }

    // loop.value is needed in here somewhere to ensure the derived value updates. But it's not
    // actually needed for the calculation. See above comments
    return loop.value ? seconds : seconds;
  });

  const setTimerState = React.useCallback(
    (newState: TimerState) => {
      if (newState.type === "stopped" || newState.type === "paused") {
        cancelAnimation(loop);
        loop.value = null;
      } else if (newState.type === "running") {
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

      state.value = newState;
    },
    [state, loop]
  );

  // When seconds changes, reset the timer
  React.useEffect(() => {
    setTimerState({
      type: "stopped",
    });
  }, [seconds, setTimerState]);

  const startTimer = React.useCallback(
    (newSeconds: number) => {
      setTimerState({
        type: "running",
        endDate: Date.now() + newSeconds * 1000,
      });

      onStart?.();
    },
    [onStart, setTimerState]
  );

  const start = React.useMemo(() => {
    if (seconds === null || seconds <= 0) return undefined;

    return () => startTimer(seconds);
  }, [seconds, startTimer]);

  const pause = React.useCallback((): boolean => {
    if (state.value.type !== "running") return false;

    const secondsLeft = (state.value.endDate - Date.now()) / 1000;

    setTimerState({ type: "paused", secondsLeft });

    return true;
  }, [setTimerState, state]);

  const stop = React.useCallback(() => {
    setTimerState({ type: "stopped" });
  }, [setTimerState]);

  const reset = stop;

  const resume = React.useCallback((): boolean => {
    // We want to resume the visible duration, if it isn't set then there's nothing to resume
    if (state.value.type !== "paused") return false;

    startTimer(state.value.secondsLeft);

    return true;
  }, [state, startTimer]);

  const addTime = React.useCallback(
    (secondsToAdd: number): boolean => {
      if (state.value.type !== "running") return false;

      setTimerState({
        type: "running",
        endDate: state.value.endDate + secondsToAdd * 1000,
      });

      return true;
    },
    [state, setTimerState]
  );

  return {
    start,
    duration,
    pause,
    stop,
    reset,
    resume,
    addTime,
    state,
  };
}
