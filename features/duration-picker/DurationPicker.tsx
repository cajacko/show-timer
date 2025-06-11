import React from "react";
import { YStack, YStackProps } from "tamagui";
import DurationDisplay from "../duration-display/DurationDisplay";
import NumberPad, { NumberPadProps } from "../number-pad/NumberPad";
import changeDuration from "./changeDuration";
import { Durations } from "./types";

export interface DurationPickerProps extends Partial<Durations>, YStackProps {
  onChange?: (props: Partial<Durations>) => void;
  showDisplay?: boolean;
}

export default React.memo(function DurationPicker({
  onChange,
  hours,
  minutes,
  seconds,
  showDisplay = true,
  ...yStackProps
}: DurationPickerProps): React.ReactNode {
  const onAction = React.useMemo<NumberPadProps["onAction"]>(() => {
    if (!onChange) return undefined;

    return (action) => {
      onChange(changeDuration({ hours, minutes, seconds }, action));
    };
  }, [hours, minutes, seconds, onChange]);

  return (
    <YStack items="center" {...yStackProps}>
      {showDisplay && (
        <DurationDisplay
          hours={hours}
          minutes={minutes}
          seconds={seconds}
          mb="$space.4"
        />
      )}
      <NumberPad onAction={onAction} />
    </YStack>
  );
});
