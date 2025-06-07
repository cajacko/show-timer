import { Delete } from "@tamagui/lucide-icons";
import React from "react";
import { Button, ButtonProps, ButtonText } from "tamagui";

export type NumberButtonValue =
  | { type: "number"; value: number }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "double-zero" };

export interface NumberButtonProps extends ButtonProps {
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "backspace" | "double-zero";
  onAction?: (value: NumberButtonValue) => void;
}

export const size = 60;

export default React.memo(function NumberButton({
  type,
  onAction,
  ...buttonProps
}: NumberButtonProps): React.ReactNode {
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

  let value: string | number | null = type;

  if (type === "double-zero") {
    value = "00";
  } else if (type === "backspace") {
    value = null;
  }

  return (
    <Button
      circular
      onPress={onPress}
      onLongPress={onLongPress}
      size="$9"
      icon={type === "backspace" ? Delete : undefined}
      {...buttonProps}
    >
      {value !== null && <ButtonText>{value}</ButtonText>}
    </Button>
  );
});
