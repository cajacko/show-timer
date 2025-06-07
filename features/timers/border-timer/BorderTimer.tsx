import Countdown from "@/features/countdown/Countdown";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { View } from "tamagui";
import { TimerProps } from "../types";

const AnimatedView = Animated.createAnimatedComponent(View);

export type BorderTimerProps = TimerProps;

export default React.memo(function BorderTimer({
  height,
  width,
  duration,
}: BorderTimerProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
  }));

  const textColor = useSharedValue<string>("#fff");

  return (
    <AnimatedView p="$4" background="red" style={animatedStyle}>
      <View
        flex={1}
        items="center"
        justify="center"
        background="$background"
        rounded="$2"
      >
        <Countdown duration={duration} color={textColor} />
      </View>
    </AnimatedView>
  );
});
