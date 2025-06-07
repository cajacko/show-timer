import React from "react";
import { YStack } from "tamagui";
import DurationDisplay from "../duration-display/DurationDisplay";
import NumberPad, { NumberPadProps } from "../number-pad/NumberPad";
import changeDuration from "./changeDuration";
import { Durations } from "./types";

export type { Durations };

export interface DurationPickerProps extends Partial<Durations> {
  onChange?: (props: Partial<Durations>) => void;
}

export default React.memo(function DurationPicker(
  props: DurationPickerProps
): React.ReactNode {
  const { onChange, hours, minutes, seconds } = props;

  const onAction = React.useMemo<NumberPadProps["onAction"]>(() => {
    if (!onChange) return undefined;

    return (action) => {
      onChange(changeDuration({ hours, minutes, seconds }, action));
    };
  }, [hours, minutes, seconds, onChange]);

  return (
    <YStack>
      <DurationDisplay hours={hours} minutes={minutes} seconds={seconds} />
      <NumberPad onAction={onAction} />
    </YStack>
  );
});
