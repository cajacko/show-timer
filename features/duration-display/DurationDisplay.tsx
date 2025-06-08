import React from "react";
import { XStack, XStackProps } from "tamagui";
import UnitDisplay from "./UnitDisplay";

export interface DurationDisplayProps extends XStackProps {
  seconds?: number;
  minutes?: number;
  hours?: number;
}

export default React.memo(function DurationDisplay({
  seconds,
  minutes,
  hours,
  ...xStackProps
}: DurationDisplayProps): React.ReactNode {
  return (
    <XStack {...xStackProps}>
      <UnitDisplay unit="h" value={hours} />
      <UnitDisplay unit="m" value={minutes} mx="$space.4" />
      <UnitDisplay unit="s" value={seconds} />
    </XStack>
  );
});
