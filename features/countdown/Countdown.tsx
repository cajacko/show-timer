import React from "react";
import {
  DerivedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { View } from "tamagui";
import AnimatedSymbol from "./AnimatedSymbol";
import AnimatedNumbers from "./AnimatedNumbers";

export interface CountdownProps {
  /**
   * Duration in seconds
   */
  duration: DerivedValue<number | null>;
  color: DerivedValue<string>;
  fontSize: DerivedValue<number>;
  opacity?: number;
  type: "time" | "duration";
}

export default React.memo(function Countdown({
  color,
  duration,
  fontSize,
  opacity,
  type,
}: CountdownProps): React.ReactNode {
  const isNegative = useDerivedValue<boolean>(() => {
    if (duration.value === null) return false;

    return duration.value < 0;
  });

  const durationAbs = useDerivedValue<number | null>(() => {
    if (duration.value === null) return null;

    return Math.abs(duration.value);
  });

  const days = useDerivedValue<number | null>(() => {
    if (type === "time") return null;
    if (durationAbs.value === null) return null;

    const days = Math.floor(durationAbs.value / 86400);

    if (days === 0) return null;

    return days;
  });

  const leadingZeroesDays = useSharedValue<boolean>(false);

  const hours = useDerivedValue<number | null>(() => {
    if (durationAbs.value === null) return null;

    const hours = Math.floor(durationAbs.value / 3600);

    if (hours === 0 && type !== "time" && days.value === null) {
      return null;
    }

    return hours;
  });

  const leadingZeroesHours = useDerivedValue<boolean>(() => {
    if (type === "time") return true;

    return days.value !== null;
  });

  const minutes = useDerivedValue<number | null>(() => {
    if (durationAbs.value === null) return null;

    const minutes = Math.floor((durationAbs.value % 3600) / 60);

    if (minutes === 0 && type !== "time" && hours.value === null) {
      return null;
    }

    return minutes;
  });

  const leadingZeroesMinutes = useDerivedValue<boolean>(() => {
    if (type === "time") return true;
    if (hours.value !== null) return true;

    return days.value !== null;
  });

  const seconds = useDerivedValue<number | null>(() => {
    if (durationAbs.value === null) return null;

    const seconds = Math.floor(durationAbs.value % 60);

    return seconds;
  });

  const leadingZeroesSeconds = useDerivedValue<boolean>(() => {
    if (type === "time") return true;
    if (minutes.value !== null) return true;
    if (hours.value !== null) return true;

    return days.value !== null;
  });

  const hasDays = useDerivedValue<boolean>(() => days.value !== null);

  return (
    <View flexDirection="row" opacity={opacity}>
      <AnimatedSymbol
        color={color}
        fontSize={fontSize}
        visible={isNegative}
        symbol="-"
      />
      <AnimatedNumbers
        value={days}
        color={color}
        fontSize={fontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesDays}
      />
      <AnimatedSymbol
        color={color}
        fontSize={fontSize}
        visible={hasDays}
        symbol=":"
      />
      <AnimatedNumbers
        value={hours}
        color={color}
        fontSize={fontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesHours}
      />
      <AnimatedSymbol
        color={color}
        fontSize={fontSize}
        visible={leadingZeroesMinutes}
        symbol=":"
      />
      <AnimatedNumbers
        value={minutes}
        color={color}
        fontSize={fontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesMinutes}
      />
      <AnimatedSymbol
        color={color}
        fontSize={fontSize}
        visible={leadingZeroesSeconds}
        symbol=":"
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
