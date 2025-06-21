import React from "react";
import { Button, ButtonProps, View, ViewProps, ButtonText } from "tamagui";
import * as z from "zod/v4";

export const stageValue = z.array(z.number());

export type StageValue = z.infer<typeof stageValue>;
export type StageButtonVariant = "units" | "colons";

export interface StageButtonProps
  extends Omit<ButtonProps, "color" | "variant">,
    Pick<ViewProps, "borderColor"> {
  value?: StageValue;
  showUnits?: boolean;
  nullValue?: string;
  variant?: StageButtonVariant;
  greyedBehaviour?: "paired" | "single";
  secondsVariant?: "default" | "small";
}

export default React.memo(function StageButton({
  value,
  borderColor,
  nullValue,
  variant = "units",
  greyedBehaviour = "single",
  secondsVariant = "default",
  ...props
}: StageButtonProps): React.ReactNode {
  // Returns
  const setDigits = React.useMemo(() => {
    if (!value) return null;

    const smallSeconds = secondsVariant === "small";

    const digits: {
      value: string | number;
      greyed?: boolean;
      unit?: boolean;
      small?: boolean;
      marginLeft?: boolean;
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
        value: variant === "units" ? "h" : ":",
        greyed: value.length <= 4,
        unit: variant === "units",
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
    ];

    if (!smallSeconds) {
      digits.push({
        value: variant === "units" ? "m" : ":",
        greyed: value.length <= 2,
        unit: variant === "units",
      });
    }

    digits.push(
      {
        value: value[1] ?? "0",
        greyed:
          greyedBehaviour === "paired"
            ? value[0] === undefined
            : value[1] === undefined,
        marginLeft: smallSeconds,
        small: smallSeconds,
      },
      {
        value: value[0] ?? "0",
        greyed: value[0] === undefined,
        small: smallSeconds,
      }
    );

    if (variant === "units") {
      digits.push({
        value: "s",
        greyed: value.length === 0,
        unit: variant === "units",
      });
    }

    return digits;
  }, [value, variant, greyedBehaviour, secondsVariant]);

  return (
    <Button position="relative" items="center" justify="center" {...props}>
      <>
        {setDigits ? (
          <>
            {setDigits.map(({ value, greyed, unit, small, marginLeft }, i) => (
              <ButtonText
                key={i}
                color={greyed ? "$black10" : undefined}
                mr={unit ? "$space.1.5" : undefined}
                size={unit || small ? "$1" : undefined}
                mt={unit || small ? 1.5 : undefined}
                ml={marginLeft ? "$space.1" : undefined}
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
