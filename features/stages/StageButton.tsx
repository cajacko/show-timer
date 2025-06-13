import React from "react";
import { Button, ButtonProps, View, ViewProps, ButtonText } from "tamagui";

export interface StageButtonProps
  extends Omit<ButtonProps, "color">,
    Pick<ViewProps, "borderColor"> {
  value?: string;
}

export default React.memo(function StageButton({
  value,
  borderColor,
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
        {value && <ButtonText>{value}</ButtonText>}
        {borderColor && (
          <View
            borderWidth={2}
            borderColor={borderColor}
            rounded="$radius.4"
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
