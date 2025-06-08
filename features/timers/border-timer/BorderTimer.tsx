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

const AnimatedView = Animated.createAnimatedComponent(View);

export default React.memo(function BorderTimer({
  height,
  width,
  duration,
  reset,
  pause,
  back,
  fullScreenAmount,
}: BorderTimerProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
    padding: Math.round(width.value * 0.01),
    backgroundColor: "red",
  }));

  const actionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fullScreenAmount.value,
    transform: [
      {
        translateY: fullScreenAmount.value === 0 ? -99999 : 0,
      },
    ],
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
        {back && (
          <AnimatedView
            position="absolute"
            t="$space.2"
            l="$space.2"
            style={actionAnimatedStyle}
          >
            <Button icon={ArrowLeft} circular size="$5" onPress={back} />
          </AnimatedView>
        )}

        <View position="relative">
          <Countdown
            duration={duration}
            color={textColor}
            fontSize={fontSize}
          />

          {(reset || pause) && (
            <AnimatedView
              flexDirection="row"
              style={actionAnimatedStyle}
              position="absolute"
              t="100%"
              width="100%"
              justify="center"
            >
              {reset && (
                <Button
                  icon={TimerReset}
                  circular
                  size="$5"
                  onPress={reset}
                  mr={!!reset ? "$space.4" : undefined}
                />
              )}
              {pause && (
                <Button icon={Pause} circular size="$5" onPress={pause} />
              )}
            </AnimatedView>
          )}
        </View>
      </View>
    </Animated.View>
  );
});
