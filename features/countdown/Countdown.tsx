import React from "react";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { View } from "tamagui";
import AnimatedColon from "./AnimatedColon";
import AnimatedNumbers from "./AnimatedNumbers";

export interface CountdownProps {
  /**
   * Duration in seconds
   */
  duration: SharedValue<number>;
  color: SharedValue<string>;
  fontSize: SharedValue<number>;
}

export default React.memo(function Countdown({
  color,
  duration,
  fontSize,
}: CountdownProps): React.ReactNode {
  const days = useDerivedValue<number | null>(() => {
    const days = Math.floor(duration.value / 86400);

    if (days === 0) return null;

    return days;
  });

  const leadingZeroesDays = useSharedValue<boolean>(false);

  const hours = useDerivedValue<number | null>(() => {
    const hours = Math.floor(duration.value / 3600);

    if (hours === 0) return null;

    return hours;
  });

  const leadingZeroesHours = useDerivedValue<boolean>(
    () => days.value !== null
  );

  const minutes = useDerivedValue<number | null>(() => {
    const minutes = Math.floor((duration.value % 3600) / 60);

    if (minutes === 0) {
      return hours.value === null ? null : 0;
    }

    return minutes;
  });

  const leadingZeroesMinutes = useDerivedValue<boolean>(
    () => hours.value !== null || days.value !== null
  );

  const seconds = useDerivedValue<number | null>(() => {
    const seconds = Math.floor(duration.value % 60);

    return seconds;
  });

  const leadingZeroesSeconds = useDerivedValue<boolean>(() => {
    return (
      minutes.value !== null || hours.value !== null || days.value !== null
    );
  });

  return (
    <View flexDirection="row">
      <AnimatedNumbers
        value={days}
        color={color}
        fontSize={fontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesDays}
      />
      <AnimatedColon
        color={color}
        fontSize={fontSize}
        visible={leadingZeroesHours}
      />
      <AnimatedNumbers
        value={hours}
        color={color}
        fontSize={fontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesHours}
      />
      <AnimatedColon
        color={color}
        fontSize={fontSize}
        visible={leadingZeroesMinutes}
      />
      <AnimatedNumbers
        value={minutes}
        color={color}
        fontSize={fontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesMinutes}
      />
      <AnimatedColon
        color={color}
        fontSize={fontSize}
        visible={leadingZeroesSeconds}
      />
      <AnimatedNumbers
        value={seconds}
        color={color}
        fontSize={fontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesSeconds}
      />
    </View>
  );
});
