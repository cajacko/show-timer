import React from "react";
import { Button, ButtonProps, View, ViewProps, ButtonText } from "tamagui";
import * as z from "zod/v4";

export const stageValue = z.array(z.number());

export type StageValue = z.infer<typeof stageValue>;
export type StageButtonVariant = "time" | "duration";

export interface StageButtonProps
  extends Omit<ButtonProps, "color" | "variant">,
    Pick<ViewProps, "borderColor"> {
  value?: StageValue;
  showUnits?: boolean;
  nullValue?: string;
  variant?: StageButtonVariant;
  greyedBehaviour?: "paired" | "single";
}

export default React.memo(function StageButton({
  value,
  borderColor,
  nullValue,
  variant = "duration",
  greyedBehaviour = "single",
  ...props
}: StageButtonProps): React.ReactNode {
  // Returns
  const setDigits = React.useMemo(() => {
    if (!value) return null;

    const digits: {
      value: string | number;
      greyed?: boolean;
      unit?: boolean;
    }[] = [
      {
        value: value[5] ?? "0",
        greyed:
          greyedBehaviour === "paired"
            ? value[4] === undefined
            : value[5] === undefined,
      },
      {
        value: value[4] ?? "0",
        greyed: value[4] === undefined,
      },
      {
        value: variant === "duration" ? "h" : ":",
        greyed: value.length <= 4,
        unit: variant === "duration",
      },
      {
        value: value[3] ?? "0",
        greyed:
          greyedBehaviour === "paired"
            ? value[2] === undefined
            : value[3] === undefined,
      },
      {
        value: value[2] ?? "0",
        greyed: value[2] === undefined,
      },
      {
        value: variant === "duration" ? "m" : ":",
        greyed: value.length <= 2,
        unit: variant === "duration",
      },
      {
        value: value[1] ?? "0",
        greyed:
          greyedBehaviour === "paired"
            ? value[0] === undefined
            : value[1] === undefined,
      },
      {
        value: value[0] ?? "0",
        greyed: value[0] === undefined,
      },
    ];

    if (variant === "duration") {
      digits.push({
        value: "s",
        greyed: value.length === 0,
        unit: variant === "duration",
      });
    }

    return digits;
  }, [value, variant, greyedBehaviour]);

  return (
    <Button position="relative" items="center" justify="center" {...props}>
      <>
        {setDigits ? (
          <>
            {setDigits.map(({ value, greyed, unit }, i) => (
              <ButtonText
                key={i}
                color={greyed ? "$black10" : undefined}
                mr={unit ? "$space.1.5" : undefined}
                size={unit ? "$1" : undefined}
                mt={unit ? 1.5 : undefined}
              >
                {value}
              </ButtonText>
            ))}
          </>
        ) : (
          <ButtonText>{nullValue}</ButtonText>
        )}
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
