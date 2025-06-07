import React from "react";
import { SharedValue } from "react-native-reanimated";
import AnimatedNumbers from "./AnimatedNumbers";
export interface CountdownProps {
  /**
   * Duration in seconds
   */
  duration: SharedValue<number>;
  color: SharedValue<string>;
  fontSize: SharedValue<number>;
}

export default React.memo(function Countdown(
  props: CountdownProps
): React.ReactNode {
  return (
    <AnimatedNumbers
      value={props.duration}
      color={props.color}
      fontSize={props.fontSize}
      maxDigits={6}
    />
  );
});
