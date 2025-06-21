import React from "react";
import {
  DerivedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { View, ViewProps } from "tamagui";
import AnimatedSymbol from "./AnimatedSymbol";
import AnimatedNumbers from "./AnimatedNumbers";

export interface CountdownProps extends Omit<ViewProps, "debug"> {
  /**
   * Duration in seconds
   */
  duration: DerivedValue<number | null>;
  color: DerivedValue<string>;
  opacity?: number;
  type: "time" | "duration";
  availableWidth: DerivedValue<number>;
  availableHeight: DerivedValue<number>;
  debug?: boolean;
  secondsVariant?: "default" | "small";
}

export const cap = 9 * 60 * 60 * 24 + 23 * 60 * 60 + 59 * 60 + 59; // 863999 seconds

export default React.memo(function Countdown({
  color,
  duration: durationProp,
  opacity,
  type,
  availableWidth,
  availableHeight,
  debug = false,
  secondsVariant: secondsVariantProp = "default",
  ...props
}: CountdownProps): React.ReactNode {
  // Cap duration in seconds at 9 days, 23 hours, 59 minutes and 59 seconds in both positive and negative
  const duration = useDerivedValue<number | null>(() => {
    const raw = durationProp.value;

    if (raw === null) return null;

    return Math.max(-cap, Math.min(cap, raw));
  });

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

  const fontSize = useDerivedValue(() => {
    const maxHeight = availableHeight.value;

    let maxWidthMultiplier: number;

    if (days.value !== null) {
      maxWidthMultiplier = 0.15;
    } else if (hours.value !== null) {
      maxWidthMultiplier = 0.2;
    } else if (minutes.value !== null) {
      maxWidthMultiplier = 0.3;
    } else {
      maxWidthMultiplier = 0.5;
    }

    const maxWidth = Math.round(availableWidth.value * maxWidthMultiplier);

    // We need a fallback min size
    return Math.max(Math.round(Math.min(maxHeight, maxWidth)), 10);
  });

  const secondsVariant = useDerivedValue(() => {
    if (secondsVariantProp === "default") return "default";

    if (minutes.value === null && hours.value === null && days.value === null) {
      return "default";
    }

    return "small";
  });

  const secondsFontSize = useDerivedValue(() => {
    if (secondsVariant.value === "default") return fontSize.value;

    return Math.max(Math.round(fontSize.value / 2), 10);
  });

  const secondsStyle = useAnimatedStyle(() => ({
    marginBottom: secondsVariant.value === "default" ? 0 : fontSize.value / 20,
    marginLeft: secondsVariant.value === "default" ? 0 : fontSize.value / 10,
  }));

  const showSecondsColon = useDerivedValue<boolean>(() => {
    if (secondsVariant.value === "default") return leadingZeroesSeconds.value;

    return false;
  });

  return (
    <View flexDirection="row" opacity={opacity} items="flex-end" {...props}>
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
        visible={showSecondsColon}
        symbol=":"
      />
      <AnimatedNumbers
        value={seconds}
        color={color}
        fontSize={secondsFontSize}
        maxDigits={2}
        leadingZeroes={leadingZeroesSeconds}
        style={secondsStyle}
      />
    </View>
  );
});
