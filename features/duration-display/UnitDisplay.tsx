import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { SizableText, XStack } from "tamagui";
import formatTwoDigitNumber from "./formatTwoDigitNumber";

export interface UnitDisplayProps {
  style?: StyleProp<ViewStyle>;
  value?: number;
  unit: "s" | "m" | "h";
}

const nullColor = "dimgray";

export default React.memo(function UnitDisplay(
  props: UnitDisplayProps
): React.ReactNode {
  const style = React.useMemo(
    () => [styles.container, props.style],
    [props.style]
  );

  const color = props.value === undefined ? nullColor : undefined;

  return (
    <XStack style={style}>
      <SizableText color={color}>
        {props.value === undefined ? "00" : formatTwoDigitNumber(props.value)}
      </SizableText>
      <SizableText color={color}>{props.unit}</SizableText>
    </XStack>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
