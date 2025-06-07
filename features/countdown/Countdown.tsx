import React from "react";
import { SharedValue } from "react-native-reanimated";
import { SizableText } from "tamagui";

export interface CountdownProps {
  /**
   * Duration in seconds
   */
  duration: SharedValue<number>;
}

export default React.memo(function Countdown(
  props: CountdownProps
): React.ReactNode {
  return <SizableText>10:12:00</SizableText>;
});
