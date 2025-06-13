import React from "react";
import { Button, ButtonProps, View, ViewProps, ButtonText } from "tamagui";

export type StageValue = number[];

export interface StageButtonProps
  extends Omit<ButtonProps, "color">,
    Pick<ViewProps, "borderColor"> {
  value?: StageValue;
  showUnits?: boolean;
  nullValue?: string;
}

export default React.memo(function StageButton({
  value,
  borderColor,
  nullValue,
  ...props
}: StageButtonProps): React.ReactNode {
  // Returns
  const setDigits = React.useMemo<
    { value: string | number; greyed?: boolean }[] | null
  >(() => {
    if (!value) return null;

    const values = [...value];

    return [
      {
        value: values[5] ?? "0",
        greyed: values[4] === undefined,
      },
      {
        value: values[4] ?? "0",
        greyed: values[4] === undefined,
      },
      {
        value: ":",
        greyed: value.length <= 4,
      },
      {
        value: values[3] ?? "0",
        greyed: values[2] === undefined,
      },
      {
        value: values[2] ?? "0",
        greyed: values[2] === undefined,
      },
      {
        value: ":",
        greyed: value.length <= 2,
      },
      {
        value: values[1] ?? "0",
        greyed: values[0] === undefined,
      },
      {
        value: values[0] ?? "0",
        greyed: values[0] === undefined,
      },
    ];
  }, [value]);

  return (
    <Button position="relative" items="center" justify="center" {...props}>
      <>
        {setDigits ? (
          <>
            {setDigits.map(({ value, greyed }, i) => (
              <ButtonText key={i} color={greyed ? "dimgray" : undefined}>
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
