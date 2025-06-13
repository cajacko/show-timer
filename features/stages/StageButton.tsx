import React from "react";
import { Button, ButtonProps, View, ViewProps, ButtonText } from "tamagui";

export type StageValue = number[];
export type StageButtonVariant = "clock" | "duration";

export interface StageButtonProps
  extends Omit<ButtonProps, "color" | "variant">,
    Pick<ViewProps, "borderColor"> {
  value?: StageValue;
  showUnits?: boolean;
  nullValue?: string;
  variant?: StageButtonVariant;
}

export default React.memo(function StageButton({
  value,
  borderColor,
  nullValue,
  variant = "duration",
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
        greyed: value[4] === undefined,
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
        greyed: value[2] === undefined,
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
        greyed: value[0] === undefined,
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
  }, [value, variant]);

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
