import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { XStack } from "tamagui";
import UnitDisplay from "./UnitDisplay";

export interface DurationDisplayProps {
  style?: StyleProp<ViewStyle>;
  seconds?: number;
  minutes?: number;
  hours?: number;
}

export default React.memo(function DurationDisplay(
  props: DurationDisplayProps
): React.ReactNode {
  const style = React.useMemo(
    () => [styles.container, props.style],
    [props.style]
  );

  return (
    <XStack style={style}>
      <UnitDisplay unit="h" value={props.hours} />
      <UnitDisplay unit="m" value={props.minutes} />
      <UnitDisplay unit="s" value={props.seconds} />
    </XStack>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
