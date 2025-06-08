import React from "react";
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TimerControls, TimerState } from "./types";

export interface UseTimerControlsProps {
  seconds: number | null; // The duration in seconds, or null for a default example duration
  onStart?: () => void; // Optional callback when the timer starts
  onComplete?: () => void; // Optional callback when the timer completes
}

const exampleDuration: number = 0;

export default function useTimerControls(
  props: UseTimerControlsProps
): TimerControls {
  const { seconds, onComplete, onStart } = props;

  const state = useSharedValue<TimerState>("stopped");

  const duration = useSharedValue<number>(
    seconds === null ? exampleDuration : seconds
  );

  const progress = useSharedValue<number>(0);

  React.useEffect(() => {
    duration.value = seconds === null ? exampleDuration : seconds;
  }, [seconds, duration]);

  const start = React.useMemo(() => {
    if (seconds === null || seconds <= 0) return undefined;

    return () => {
      onStart?.();

      state.value = "running";

      duration.value = withTiming(
        0,
        {
          duration: seconds * 1000,
          easing: Easing.linear,
        },
        (finished) => {
          if (!finished) return;

          state.value = "stopped";
          progress.value = 0; // Reset progress after completion
          duration.value = seconds; // Reset duration to the original value

          if (onComplete) {
            runOnJS(onComplete)();
          }
        }
      );

      progress.value = withTiming(1, {
        duration: seconds * 1000,
        easing: Easing.linear,
      });
    };
  }, [seconds, duration, progress, onStart, onComplete, state]);

  const pause = React.useMemo(() => {
    if (seconds === null || seconds <= 0) return undefined;

    return () => {
      state.value = "paused";

      cancelAnimation(duration);
      cancelAnimation(progress);
    };
  }, [duration, progress, state, seconds]);

  const stop = React.useMemo(() => {
    if (seconds === null || seconds <= 0) return undefined;

    return () => {
      state.value = "stopped";
      duration.value = seconds === null ? exampleDuration : seconds;
      progress.value = 0; // Reset progress to 0
    };
  }, [seconds, duration, progress, state]);

  const reset = stop;

  const resume = React.useMemo(() => {
    if (seconds === null || seconds <= 0) return undefined;

    return () => {
      // If the timer isn't paused there's nothing to resume
      if (state.value !== "paused") return;

      state.value = "running";

      const remainingMs = duration.value * 1000;

      duration.value = withTiming(
        0,
        {
          duration: remainingMs,
          easing: Easing.linear,
        },
        (finished) => {
          if (!finished) return;

          state.value = "stopped";
          progress.value = 0;
          duration.value = seconds;

          if (onComplete) {
            runOnJS(onComplete)();
          }
        }
      );

      progress.value = withTiming(1, {
        duration: remainingMs,
        easing: Easing.linear,
      });
    };
  }, [seconds, duration, progress, state, onComplete]);

  const addTime = React.useCallback((secondsToAdd: number) => {
    // TODO:
  }, []);

  return {
    start,
    duration,
    progress,
    pause,
    stop,
    reset,
    resume,
    addTime,
    state,
  };
}
