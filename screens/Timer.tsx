import DurationPicker, {
  Durations,
} from "@/features/duration-picker/DurationPicker";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

export interface TimerScreenProps {
  style?: StyleProp<ViewStyle>;
}

export default React.memo(function TimerScreen(
  props: TimerScreenProps
): React.ReactNode {
  const style = React.useMemo(
    () => [styles.container, props.style],
    [props.style]
  );

  const [durations, setDurations] = React.useState<Partial<Durations>>({});

  return (
    <View style={style}>
      <DurationPicker
        hours={durations.hours}
        minutes={durations.minutes}
        seconds={durations.seconds}
        onChange={setDurations}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
