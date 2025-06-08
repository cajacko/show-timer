import React from "react";
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TimerControls } from "./types";

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

      duration.value = withTiming(
        0,
        {
          duration: seconds * 1000,
          easing: Easing.linear,
        },
        (finished) => {
          if (!finished) return;

          if (onComplete) {
            runOnJS(onComplete)();
          }

          progress.value = 0; // Reset progress after completion
          duration.value = seconds; // Reset duration to the original value
        }
      );

      progress.value = withTiming(1, {
        duration: seconds * 1000,
        easing: Easing.linear,
      });
    };
  }, [seconds, duration, progress, onStart, onComplete]);

  const pause = React.useCallback(() => {
    cancelAnimation(duration);
    cancelAnimation(progress);
  }, [duration, progress]);

  const stop = React.useCallback(() => {
    duration.value = seconds === null ? exampleDuration : seconds;
    progress.value = 0; // Reset progress to 0
  }, [seconds, duration, progress]);

  const reset = React.useCallback(() => {
    stop();
    start?.();
  }, [stop, start]);

  const resume = React.useCallback(() => {
    // TODO: Implement resume functionality
    reset();
  }, [reset]);

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
  };
}
