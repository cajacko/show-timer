import DurationPicker, {
  Durations,
} from "@/features/duration-picker/DurationPicker";
import TimerLayout, {
  TimerLayoutChild,
} from "@/features/timer-layout/TimerLayout";
import Timers from "@/features/timers/Timers";
import { Play } from "@tamagui/lucide-icons";
import React from "react";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScrollView, YStack } from "tamagui";

function durationsToSeconds(durations: Partial<Durations>): number | null {
  const { hours, minutes, seconds } = durations;

  if (hours === undefined && minutes === undefined && seconds === undefined) {
    return null;
  }

  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
}

// To show 01:15:30 in seconds
const exampleDuration: number = 1 * 3600 + 15 * 60 + 30; // 1 hour, 15 minutes, and 30 seconds

export default React.memo(function TimerScreen(): React.ReactNode {
  const [durations, setDurations] = React.useState<Partial<Durations>>({});

  const seconds = React.useMemo(
    () => durationsToSeconds(durations),
    [durations]
  );

  const duration = useSharedValue<number>(
    seconds === null ? exampleDuration : seconds
  );

  const progress = useSharedValue<number>(0);

  const bottomVisibility = useSharedValue<number>(1);

  React.useEffect(() => {
    duration.value = seconds === null ? exampleDuration : seconds;
  }, [seconds, duration]);

  const start = React.useMemo(() => {
    if (seconds === null || seconds <= 0) return;

    return () => {
      console.log("start");

      bottomVisibility.value = withTiming(0, {
        duration: 500,
      });

      duration.value = withTiming(
        0,
        {
          duration: seconds * 1000,
          easing: Easing.linear,
        },
        () => {
          bottomVisibility.value = withTiming(1, {
            duration: 500,
          });
          progress.value = 0; // Reset progress after completion
          duration.value = seconds; // Reset duration to the original value
        }
      );

      progress.value = withTiming(1, {
        duration: seconds * 1000,
        easing: Easing.linear,
      });
    };
  }, [seconds, duration, progress, bottomVisibility]);

  const timers = React.useMemo<TimerLayoutChild>(
    () =>
      function TimersChild({ height, width }) {
        return (
          <Timers
            width={width}
            height={height}
            duration={duration}
            progress={progress}
          />
        );
      },
    [duration, progress]
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
