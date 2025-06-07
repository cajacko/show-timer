import React from "react";
import { SizableText, XStack, XStackProps } from "tamagui";
import formatTwoDigitNumber from "./formatTwoDigitNumber";

export interface UnitDisplayProps extends XStackProps {
  value?: number;
  unit: "s" | "m" | "h";
}

const nullColor = "dimgray";

export default React.memo(function UnitDisplay({
  value,
  unit,
  ...xStackProps
}: UnitDisplayProps): React.ReactNode {
  const color = value === undefined ? nullColor : undefined;

  return (
    <XStack items="baseline" {...xStackProps}>
      <SizableText color={color} size="$10">
        {value === undefined ? "00" : formatTwoDigitNumber(value)}
      </SizableText>
      <SizableText color={color} size="$4">
        {unit}
      </SizableText>
    </XStack>
  );
});
