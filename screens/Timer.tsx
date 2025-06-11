import DurationPicker from "@/features-2/duration-picker/DurationPicker";
import { Durations } from "@/features-2/duration-picker/types";
import StageSelector from "@/features-2/stages/StageSelector";
import TimerLayout, {
  TimerLayoutChild,
} from "@/features-2/timer-layout/TimerLayout";
import Timers from "@/features-2/timers/Timers";
import useTimerControls from "@/features-2/timers/useTimerControls";
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
  const [greenDurations, setGreenDurations] = React.useState<
    Partial<Durations>
  >({
    minutes: 5,
    seconds: 0,
  });

  const [yellowDurations, setYellowDurations] = React.useState<
    Partial<Durations>
  >({});

  const [redDurations, setRedDurations] = React.useState<Partial<Durations>>(
    {}
  );

  const [stage, setStage] = React.useState<"green" | "yellow" | "red">("green");

  const { durations, setDurations } = React.useMemo(() => {
    if (stage === "green") {
      return { durations: greenDurations, setDurations: setGreenDurations };
    } else if (stage === "yellow") {
      return { durations: yellowDurations, setDurations: setYellowDurations };
    }
    return { durations: redDurations, setDurations: setRedDurations };
  }, [stage, greenDurations, yellowDurations, redDurations]);

  const seconds = React.useMemo(
    () => durationsToSeconds(greenDurations),
    [greenDurations]
  );

  const bottomVisibility = useSharedValue<number>(1);

  const { duration, pause, reset, resume, start, addTime, stop, state } =
    useTimerControls({
      seconds,
      onStart: React.useCallback(() => {
        bottomVisibility.value = withTiming(0, {
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
                  scale={1}
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
        <ScrollView flex={1} mt="$space.4">
          <YStack items="center">
            <StageSelector
              active={stage}
              onChange={setStage}
              green={greenDurations}
              yellow={yellowDurations}
              red={redDurations}
              mb="$space.4"
              activePosition="bottom"
            />
            <DurationPicker
              showDisplay={false}
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
