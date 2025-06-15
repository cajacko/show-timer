import Countdown from "@/features-2/countdown/Countdown";
import {
  ArrowLeft,
  Pause,
  Play,
  TimerReset,
  LockKeyhole,
  LockKeyholeOpen,
} from "@tamagui/lucide-icons";
import React from "react";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Button, useTheme, View } from "tamagui";
import { TimerProps } from "../types";
import stageColors from "@/features/stages/stageColors";
import { useOrientation } from "@/hooks/useOrientation";
import { Platform } from "react-native";

export type BorderTimerProps = TimerProps;

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedButton = Animated.createAnimatedComponent(Button);

export default React.memo(function BorderTimer({
  height,
  width,
  duration: durationProp,
  reset,
  pause,
  back,
  fullScreenAmount,
  state,
  start,
  resume,
  colorVariant = "border",
  showText = true,
  stage,
  lockedOrientation,
  lockOrientation,
}: BorderTimerProps): React.ReactNode {
  const _orientation = useOrientation();
  const orientation = lockedOrientation ?? _orientation;

  const theme = useTheme();
  const backgroundColor = theme[stageColors[stage]]?.val;

  const duration = useDerivedValue<number | null>(
    () => (durationProp.value === null ? 0 : durationProp.value),
    [durationProp]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
    padding: colorVariant === "border" ? Math.round(width.value * 0.03) : 0,
    backgroundColor,
  }));

  const actionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fullScreenAmount?.value ?? 1,
    transform: [
      {
        translateY: fullScreenAmount?.value === 0 ? -99999 : 0,
      },
    ],
  }));

  const pauseAnimation = useSharedValue(0);

  React.useEffect(() => {
    pauseAnimation.value = withRepeat(
      withTiming(1, { duration: 500 }),
      -1,
      true
    );
  }, [pauseAnimation]);

  const textColor = useDerivedValue(() => {
    if (state.value.type !== "paused") return "white";

    return interpolateColor(
      pauseAnimation.value,
      [0, 1],
      ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"]
    );
  });

  const fontSize = useDerivedValue(() => {
    return Math.round(width.value * 0.2);
  });

  const pauseStyle = useAnimatedStyle(() => ({
    opacity: state.value.type === "running" ? 1 : 0,
    transform: [
      {
        translateY: state.value.type === "running" ? 0 : -99999,
      },
    ],
  }));

  const startRotation = useSharedValue(0);

  const startStyle = useAnimatedStyle(() => ({
    opacity: state.value.type === "stopped" ? 1 : 0,
    transform: [
      {
        translateY: state.value.type === "stopped" ? 0 : -99999,
      },
      {
        rotate: `${startRotation.value}deg`,
      },
    ],
  }));

  React.useEffect(() => {
    if (Platform.OS === "web") return;

    let rotation: number;

    switch (orientation) {
      case "portrait-up":
        rotation = 0;
        break;
      case "portrait-down":
        rotation = 180;
        break;
      case "landscape-left":
        rotation = -90;
        break;
      case "landscape-right":
        rotation = 90;
        break;
    }

    startRotation.value = withTiming(rotation);
  }, [startRotation, orientation]);

  const resumeStyle = useAnimatedStyle(() => ({
    opacity: state.value.type === "paused" ? 1 : 0,
    transform: [
      {
        translateY: state.value.type === "paused" ? 0 : -99999,
      },
    ],
  }));

  const lockUnlock = React.useMemo(() => {
    if (!lockOrientation) return undefined;

    return () => {
      if (lockedOrientation) {
        lockOrientation(null);
      } else {
        lockOrientation(orientation);
      }
    };
  }, [lockedOrientation, lockOrientation, orientation]);

  return (
    <Animated.View style={animatedStyle}>
      <View
        items="center"
        justify="center"
        flex={1}
        // TODO: Fix this in native
        style={{
          backgroundColor: colorVariant === "border" ? "black" : "transparent",
        }}
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

        {lockUnlock && (
          <AnimatedView position="absolute" t="$space.2" r="$space.2">
            <Button
              icon={lockedOrientation ? LockKeyhole : LockKeyholeOpen}
              circular
              size="$5"
              onPress={lockUnlock}
            />
          </AnimatedView>
        )}

        <View position="relative">
          <Countdown
            duration={duration}
            color={textColor}
            fontSize={fontSize}
            opacity={showText ? 1 : 0.2}
          />

          <AnimatedView
            flexDirection="row"
            style={actionAnimatedStyle}
            position="absolute"
            t="100%"
            l={-100}
            r={-100}
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
            {(pause || start || resume) && (
              <View position="relative">
                <Button circular size="$5" opacity={0} z={1} disabled />
                {pause && (
                  <AnimatedButton
                    icon={Pause}
                    circular
                    size="$5"
                    onPress={pause}
                    style={pauseStyle}
                    position="absolute"
                    z={2}
                  />
                )}
                {start && (
                  <AnimatedButton
                    icon={Play}
                    circular
                    size="$5"
                    onPress={start}
                    position="absolute"
                    style={startStyle}
                    z={2}
                  />
                )}
                {resume && (
                  <AnimatedButton
                    icon={Play}
                    circular
                    size="$5"
                    onPress={resume}
                    position="absolute"
                    style={resumeStyle}
                    z={2}
                  />
                )}
              </View>
            )}
          </AnimatedView>
        </View>
      </View>
    </Animated.View>
  );
});
