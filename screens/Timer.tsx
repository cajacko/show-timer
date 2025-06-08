import DurationPicker, {
  Durations,
} from "@/features/duration-picker/DurationPicker";
import TimerLayout, {
  TimerLayoutChild,
} from "@/features/timer-layout/TimerLayout";
import Timers from "@/features/timers/Timers";
import useTimerControls from "@/features/timers/useTimerControls";
import { Play } from "@tamagui/lucide-icons";
import React from "react";
import { View } from "react-native";
import {
  interpolate,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, YStack } from "tamagui";

function durationsToSeconds(durations: Partial<Durations>): number | null {
  const { hours, minutes, seconds } = durations;

  if (hours === undefined && minutes === undefined && seconds === undefined) {
    return null;
  }

  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
}

export default React.memo(function TimerScreen(): React.ReactNode {
  const [durations, setDurations] = React.useState<Partial<Durations>>({});

  const seconds = React.useMemo(
    () => durationsToSeconds(durations),
    [durations]
  );

  const bottomVisibility = useSharedValue<number>(1);

  const { duration, progress, pause, reset, resume, start, addTime, stop } =
    useTimerControls({
      seconds,
      onStart: React.useCallback(() => {
        bottomVisibility.value = withTiming(0, {
          duration: 500,
        });
      }, [bottomVisibility]),
      onComplete: React.useCallback(() => {
        bottomVisibility.value = withTiming(1, {
          duration: 500,
        });
      }, [bottomVisibility]),
    });

  const back = React.useCallback(() => {
    bottomVisibility.value = withTiming(1, {
      duration: 500,
    });
  }, [bottomVisibility]);

  const fullScreenAmount = useDerivedValue(() =>
    interpolate(bottomVisibility.value, [0, 1], [1, 0])
  );

  const timers = React.useMemo<TimerLayoutChild>(
    () =>
      function TimersChild({ height, width }) {
        return (
          <View
            style={{ flex: 1 }}
            onStartShouldSetResponder={() => bottomVisibility.value === 1}
            onResponderRelease={() => {
              bottomVisibility.value = withTiming(0, { duration: 500 });
            }}
          >
            <Timers
              width={width}
              height={height}
              duration={duration}
              progress={progress}
              start={start}
              reset={reset}
              resume={resume}
              pause={pause}
              stop={stop}
              addTime={addTime}
              back={back}
              fullScreenAmount={fullScreenAmount}
            />
          </View>
        );
      },
    [
      duration,
      progress,
      start,
      reset,
      resume,
      pause,
      stop,
      addTime,
      back,
      bottomVisibility,
      fullScreenAmount,
    ]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TimerLayout flex={1} bottomVisibility={bottomVisibility}>
        {timers}
        <ScrollView flex={1}>
          <YStack items="center">
            <DurationPicker
              hours={durations.hours}
              minutes={durations.minutes}
              seconds={durations.seconds}
              onChange={setDurations}
            />
            {start && (
              <Button circular size="$9" mt="$6" icon={Play} onPress={start} />
            )}
          </YStack>
        </ScrollView>
      </TimerLayout>
    </SafeAreaView>
  );
});
