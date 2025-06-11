import React from "react";
import { Button, ButtonProps, View } from "tamagui";
import DurationDisplay from "../duration-display/DurationDisplay";
import { Durations } from "../duration-picker/types";

export interface StageButtonProps extends Omit<ButtonProps, "color"> {
  durations?: Durations;
  color?: string;
  flash?: boolean;
}

export default React.memo(function StageButton({
  durations,
  color,
  flash,
  ...props
}: StageButtonProps): React.ReactNode {
  return (
    <Button
      position="relative"
      width="$8"
      items="center"
      justify="center"
      {...props}
    >
      <>
        <DurationDisplay
          {...durations}
          valueSize="$5"
          unitSize="$2"
          spacing="$space.1"
        />
        {color && (
          <View
            borderWidth={2}
            borderColor={color}
            borderRadius="$radius.4"
            position="absolute"
            t={0}
            b={0}
            r={0}
            l={0}
          />
        )}
      </>
    </Button>
  );
});
