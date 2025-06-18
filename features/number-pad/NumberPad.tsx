import NumberButton, {
  NumberButtonProps,
  NumberButtonValue,
} from "@/features/number-pad/NumberButton";
import React from "react";
import { XStack, YStack, YStackProps } from "tamagui";

export type { NumberButtonValue };

export type NumberButtonKey =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | "backspace"
  | "double-zero";

const grid: NumberButtonKey[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ["double-zero", 0, "backspace"],
];

export interface NumberPadProps
  extends Omit<YStackProps, "borderColor">,
    Pick<NumberButtonProps, "borderColor"> {
  onAction?: (value: NumberButtonValue) => void;
  disabledButtons?: NumberButtonKey[];
}

const margin = "$space.2";

export default React.memo(function NumberPad({
  onAction,
  borderColor,
  disabledButtons,
  disabled,
  ...yStackProps
}: NumberPadProps): React.ReactNode {
  return (
    <YStack {...yStackProps}>
      {grid.map((row, rowIndex) => (
        <XStack key={rowIndex} mt={rowIndex === 0 ? undefined : margin}>
          {row.map((key, columnIndex) => {
            const itemDisabled =
              disabled || disabledButtons?.some((b) => key === b);

            return (
              <NumberButton
                key={key}
                type={key}
                borderColor={itemDisabled ? undefined : borderColor}
                onAction={onAction}
                ml={columnIndex === 0 ? undefined : margin}
                disabled={itemDisabled}
              />
            );
          })}
        </XStack>
      ))}
    </YStack>
  );
});
