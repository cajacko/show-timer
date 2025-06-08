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
import {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, View, YStack, styled } from "tamagui";

const SafeAreaView = styled(RNSafeAreaView);

function durationsToSeconds(durations: Partial<Durations>): number | null {
  const { hours, minutes, seconds } = durations;

  if (hours === undefined && minutes === undefined && seconds === undefined) {
    return null;
  }

  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
}

const bottomVisibilityDuration = 200;

export default React.memo(function TimerScreen(): React.ReactNode {
  const [durations, setDurations] = React.useState<Partial<Durations>>({});

  const seconds = React.useMemo(
    () => durationsToSeconds(durations),
    [durations]
  );

  const bottomVisibility = useSharedValue<number>(1);

  const {
    duration,
    progress,
    pause,
    reset,
    resume,
    start,
    addTime,
    stop,
    state,
  } = useTimerControls({
    seconds,
    onStart: React.useCallback(() => {
      bottomVisibility.value = withTiming(0, {
        duration: bottomVisibilityDuration,
      });
    }, [bottomVisibility]),
    onComplete: React.useCallback(() => {
      bottomVisibility.value = withTiming(1, {
        duration: bottomVisibilityDuration,
      });
    }, [bottomVisibility]),
  });

  const back = React.useCallback(() => {
    bottomVisibility.value = withTiming(1, {
      duration: bottomVisibilityDuration,
    });
  }, [bottomVisibility]);

  const fullScreenAmount = useDerivedValue(() =>
    interpolate(bottomVisibility.value, [0, 1], [1, 0])
  );

  const overlayStyle = useAnimatedStyle(() => ({}));

  const timers = React.useMemo<TimerLayoutChild>(
    () =>
      function TimersChild({ height, width }) {
        return (
          <View flex={1} position="relative">
            {start && (
              <View
                position="absolute"
                t={0}
                b={0}
                r={0}
                l={0}
                items="center"
                justify="center"
                style={overlayStyle}
              >
                <Button
                  circular
                  size="$9"
                  mt="$6"
                  icon={Play}
                  onPress={start}
                  z={2}
                  opacity={0.75}
                />
              </View>
            )}
            <Timers
              position="relative"
              z={1}
              state={state}
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
      fullScreenAmount,
      state,
      overlayStyle,
    ]
  );

  return (
    <SafeAreaView flex={1}>
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
          </YStack>
        </ScrollView>
      </TimerLayout>
    </SafeAreaView>
  );
});
