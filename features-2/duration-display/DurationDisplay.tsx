import React from "react";
import {
  FontSizeTokens,
  GetThemeValueForKey,
  XStack,
  XStackProps,
} from "tamagui";
import { Durations } from "../duration-picker/types";
import UnitDisplay from "./UnitDisplay";

export interface DurationDisplayProps extends XStackProps, Durations {
  valueSize?: FontSizeTokens;
  unitSize?: FontSizeTokens;
  spacing?: GetThemeValueForKey<"marginHorizontal">;
}

export default React.memo(function DurationDisplay({
  seconds,
  minutes,
  hours,
  valueSize,
  unitSize,
  spacing = "$space.4",
  ...xStackProps
}: DurationDisplayProps): React.ReactNode {
  return (
    <XStack {...xStackProps}>
      {hours !== undefined && (
        <UnitDisplay
          unit="h"
          value={hours ?? 0}
          valueSize={valueSize}
          unitSize={unitSize}
        />
      )}
      {minutes !== undefined && (
        <UnitDisplay
          unit="m"
          value={minutes ?? 0}
          mx={spacing}
          valueSize={valueSize}
          unitSize={unitSize}
          twoDigits={hours !== undefined}
        />
      )}
      {seconds !== undefined && (
        <UnitDisplay
          unit="s"
          value={seconds ?? 0}
          valueSize={valueSize}
          unitSize={unitSize}
          twoDigits={minutes !== undefined || hours !== undefined}
        />
      )}
    </XStack>
  );
});
