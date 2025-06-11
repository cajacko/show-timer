import React from "react";
import { FontSizeTokens, SizableText, XStack, XStackProps } from "tamagui";
import formatTwoDigitNumber from "./formatTwoDigitNumber";

export interface UnitDisplayProps extends XStackProps {
  value: number;
  unit: "s" | "m" | "h";
  valueSize?: FontSizeTokens;
  unitSize?: FontSizeTokens;
  twoDigits?: boolean;
}

const nullColor = "dimgray";

export default React.memo(function UnitDisplay({
  value,
  unit,
  valueSize = "$10",
  unitSize = "$4",
  twoDigits = false,
  ...xStackProps
}: UnitDisplayProps): React.ReactNode {
  const color = value === undefined ? nullColor : undefined;

  return (
    <XStack items="baseline" {...xStackProps}>
      <SizableText color={color} size={valueSize}>
        {twoDigits ? formatTwoDigitNumber(value) : value}
      </SizableText>
      <SizableText color={color} size={unitSize}>
        {unit}
      </SizableText>
    </XStack>
  );
});
