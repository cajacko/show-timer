import DurationPicker, {
  Durations,
} from "@/features/duration-picker/DurationPicker";
import Timers from "@/features/timers/Timers";
import { Play } from "@tamagui/lucide-icons";
import React from "react";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, YStack } from "tamagui";

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

  React.useEffect(() => {
    duration.value = seconds === null ? exampleDuration : seconds;
  }, [seconds, duration]);

  const start = React.useMemo(() => {
    if (seconds === null || seconds <= 0) return;

    return () => {
      console.log("start");

      duration.value = withTiming(0, {
        duration: seconds * 1000,
        easing: Easing.linear,
      });
      progress.value = withTiming(1, {
        duration: seconds * 1000,
        easing: Easing.linear,
      });
    };
  }, [seconds, duration, progress]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack items="center">
        <Timers
          width="100%"
          height={300}
          duration={duration}
          progress={progress}
        />
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
    </SafeAreaView>
  );
});
