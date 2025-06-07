import Countdown from "@/features/countdown/Countdown";
import { ArrowLeft, Pause, TimerReset } from "@tamagui/lucide-icons";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Button, View } from "tamagui";
import { TimerProps } from "../types";

export type BorderTimerProps = TimerProps;

export default React.memo(function BorderTimer({
  height,
  width,
  duration,
  reset,
  pause,
  back,
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
        {back && <Button icon={ArrowLeft} circular size="$5" onPress={back} />}
        <Countdown duration={duration} color={textColor} fontSize={fontSize} />
        {reset && (
          <Button icon={TimerReset} circular size="$5" onPress={reset} />
        )}
        {pause && <Button icon={Pause} circular size="$5" onPress={pause} />}
      </View>
    </Animated.View>
  );
});
