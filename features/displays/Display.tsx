import { Stage } from "@/features/stages/Stage.types";
import React from "react";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button, useTheme, View, ViewProps } from "tamagui";
import Countdown from "@/features-2/countdown/Countdown";
import stageColors from "@/features/stages/stageColors";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { ChevronLeft } from "@tamagui/lucide-icons";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedButton = Animated.createAnimatedComponent(Button);

export interface DisplayProps extends Omit<ViewProps, "height" | "width"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  back: () => void;
  colorVariant?: "border" | "background";
  showText?: boolean;
  stage: Stage;
  onPress?: () => { handled: boolean };
  duration: SharedValue<number | null>;
  fullScreenAmount: SharedValue<number>;
  // pause?: () => void;
  // resume?: () => void;
  // reset?: () => void;
}

const actionsDuration = 300;

export default React.memo(function Display({
  height,
  width,
  back: backProp,
  colorVariant,
  showText,
  stage,
  onPress,
  duration: durationProp,
  fullScreenAmount,
  ...props
}: DisplayProps): React.ReactNode {
  const duration = useDerivedValue<number | null>(
    () => (durationProp.value === null ? 0 : durationProp.value),
    [durationProp]
  );

  const theme = useTheme();
  const backgroundColor = theme[stageColors[stage]]?.val;

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
    padding: colorVariant === "border" ? Math.round(width.value * 0.03) : 0,
    backgroundColor,
  }));

  const fontSize = useDerivedValue(() => {
    return Math.round(width.value * 0.2);
  });

  const textColor = useDerivedValue(() => {
    return "white";
  });

  const _showActions = useSharedValue<number>(0);

  const showActions = useDerivedValue(() => {
    if (_showActions.value === 0) return 0;
    if (fullScreenAmount.value !== 1) return fullScreenAmount.value;

    return _showActions.value;
  });

  const onTap = React.useCallback(() => {
    const { handled } = onPress?.() || {};

    if (handled) {
      return;
    }

    _showActions.value = withTiming(_showActions.value === 1 ? 0 : 1, {
      duration: actionsDuration,
    });
  }, [onPress, _showActions]);

  const gesture = React.useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        runOnJS(onTap)();
      }),
    [onTap]
  );

  const backStyle = useAnimatedStyle(() => {
    return {
      opacity: showActions.value,
      transform: [
        {
          scale: showActions.value,
        },
      ],
    };
  });

  const back = React.useCallback(() => {
    _showActions.value = withTiming(0, {
      duration: actionsDuration,
    });

    backProp();
  }, [_showActions, backProp]);

  return (
    <GestureDetector gesture={gesture}>
      <AnimatedView {...props} style={animatedStyle}>
        <AnimatedButton
          icon={ChevronLeft}
          onPress={back}
          size="$5"
          circular
          style={backStyle}
          position="absolute"
          t="$space.4"
          l="$space.4"
          z={2}
        />
        <View
          position="relative"
          z={1}
          items="center"
          justify="center"
          flex={1}
          // TODO: Fix this in native
          style={{
            backgroundColor:
              colorVariant === "border" ? "black" : "transparent",
          }}
        >
          <Countdown
            duration={duration}
            color={textColor}
            fontSize={fontSize}
            opacity={showText ? 1 : 0.2}
          />
        </View>
      </AnimatedView>
    </GestureDetector>
  );
});
