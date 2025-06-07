import NumberButton, {
  NumberButtonValue,
} from "@/features/number-pad/NumberButton";
import React from "react";
import { XStack, YStack } from "tamagui";

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

export interface NumberPadProps {
  onAction?: (value: NumberButtonValue) => void;
}

export default React.memo(function NumberPad(
  props: NumberPadProps
): React.ReactNode {
  return (
    <YStack>
      {grid.map((row, rowIndex) => (
        <XStack key={rowIndex}>
          {row.map((type) => (
            <NumberButton key={type} type={type} onAction={props.onAction} />
          ))}
        </XStack>
      ))}
    </YStack>
  );
});
