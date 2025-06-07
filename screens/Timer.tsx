import DurationPicker, {
  Durations,
} from "@/features/duration-picker/DurationPicker";
import { Play } from "@tamagui/lucide-icons";
import React from "react";
import { Button, YStack } from "tamagui";

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

  return (
    <YStack items="center">
      <DurationPicker
        hours={durations.hours}
        minutes={durations.minutes}
        seconds={durations.seconds}
        onChange={setDurations}
      />
      {seconds !== null && (
        <Button circular size="$9" mt="$6" icon={Play}></Button>
      )}
    </YStack>
  );
});
