import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

export interface DurationPickerProps {
  style?: StyleProp<ViewStyle>;
}

export default React.memo(function DurationPicker(
  props: DurationPickerProps
): React.ReactNode {
  const style = React.useMemo(
    () => [styles.container, props.style],
    [props.style]
  );

  return <View style={style}></View>;
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
