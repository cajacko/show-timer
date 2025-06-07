import NumberButton, {
  NumberButtonValue,
} from "@/features/number-pad/NumberButton";
import React from "react";
import { XStack, YStack, YStackProps } from "tamagui";

export type { NumberButtonValue };

const grid: (
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
  | "double-zero"
)[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ["double-zero", 0, "backspace"],
];

export interface NumberPadProps extends YStackProps {
  onAction?: (value: NumberButtonValue) => void;
}

const margin = "$2";

export default React.memo(function NumberPad({
  onAction,
  ...yStackProps
}: NumberPadProps): React.ReactNode {
  return (
    <YStack {...yStackProps}>
      {grid.map((row, rowIndex) => (
        <XStack key={rowIndex} mt={rowIndex === 0 ? undefined : margin}>
          {row.map((type, columnIndex) => (
            <NumberButton
              key={type}
              type={type}
              onAction={onAction}
              ml={columnIndex === 0 ? undefined : margin}
            />
          ))}
        </XStack>
      ))}
    </YStack>
  );
});
