import React, { ComponentProps } from "react";
import { StyleSheet } from "react-native";
import { Button, ButtonText } from "tamagui";

export type NumberButtonValue =
  | { type: "number"; value: number }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "double-zero" };

export interface NumberButtonProps
  extends Pick<ComponentProps<typeof Button>, "style"> {
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "backspace" | "double-zero";
  onAction?: (value: NumberButtonValue) => void;
}

export const size = 60;

export default React.memo(function NumberButton({
  type,
  onAction,
  style: styleProp,
}: NumberButtonProps): React.ReactNode {
  const style = React.useMemo(
    () => StyleSheet.flatten([styles.container, styleProp]),
    [styleProp]
  );

  const onPress = React.useMemo(() => {
    if (!onAction) return undefined;

    return () => {
      if (type === "backspace") {
        onAction({ type: "backspace" });
      } else if (type === "double-zero") {
        onAction({ type: "double-zero" });
      } else {
        onAction({ type: "number", value: type });
      }
    };
  }, [onAction, type]);

  const onLongPress = React.useMemo(() => {
    if (type !== "backspace") return undefined;
    if (!onAction) return undefined;

    return () => {
      onAction({ type: "clear" });
    };
  }, [onAction, type]);

  let value: string | number = type;

  if (type === "double-zero") {
    value = "00";
  } else if (type === "backspace") {
    value = "<-";
  }

  return (
    <Button onPress={onPress} onLongPress={onLongPress} size="$7">
      <ButtonText>{value}</ButtonText>
    </Button>
  );
});

const styles = StyleSheet.create({
  container: {
    height: size,
    width: size,
    borderRadius: size / 2,
  },
});
