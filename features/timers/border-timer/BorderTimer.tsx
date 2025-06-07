import Countdown from "@/features/countdown/Countdown";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { View } from "tamagui";
import { TimerProps } from "../types";

export type BorderTimerProps = TimerProps;

export default React.memo(function BorderTimer({
  height,
  width,
  duration,
}: BorderTimerProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
    padding: Math.round(width.value * 0.01),
    backgroundColor: "red",
  }));

  const textColor = useSharedValue<string>("#fff");

  const fontSize = useDerivedValue(() => {
    return Math.round(width.value * 0.2);
  });

  return (
    <Animated.View style={animatedStyle}>
      <View
        items="center"
        justify="center"
        flex={1}
        background="black"
        // TODO: Fix this in native
        style={{ backgroundColor: "black" }}
      >
        <Countdown duration={duration} color={textColor} fontSize={fontSize} />
      </View>
    </Animated.View>
  );
});
