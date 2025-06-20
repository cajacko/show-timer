import {
  Maximize2,
  Pause,
  Play,
  Plus,
  RefreshCcw,
} from "@tamagui/lucide-icons";
import React from "react";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { View, ViewProps, Button } from "tamagui";

const AnimatedButton = Animated.createAnimatedComponent(Button);
const AnimatedView = Animated.createAnimatedComponent(View);

const mx = 5;

export interface TimerActionsProps
  extends Omit<ViewProps, "start" | "visibility"> {
  fullScreen?: () => void;
  start?: () => void;
  pause?: () => void;
  addMinute?: () => void;
  reset?: () => void;
  visibility?: SharedValue<number>;
  fullScreenVisibility?: SharedValue<number>;
}

export function useTimerActionSize(): {
  buttonSize: "$5";
  height: number;
  width: number;
} {
  const size = 52;

  return {
    buttonSize: "$5",
    height: size,
    width: size,
  };
}

export default React.memo(function TimerActions({
  fullScreen,
  start,
  pause,
  addMinute,
  reset,
  visibility,
  fullScreenVisibility,
  ...props
}: TimerActionsProps): React.ReactNode {
  const { buttonSize, height, width } = useTimerActionSize();

  const style = useAnimatedStyle(() => {
    const _visibility = visibility ? visibility.value : 1;

    return {
      opacity: _visibility,
      transform: [{ scale: _visibility }],
    };
  });

  const fullScreenStyle = useAnimatedStyle(() => {
    const _visibility = fullScreenVisibility
      ? fullScreenVisibility.value
      : visibility
      ? visibility.value
      : 1;

    const _mx = interpolate(_visibility, [0, 1], [0, mx]);

    return {
      opacity: _visibility,
      transform: [{ scale: _visibility }],
      width: interpolate(_visibility, [0, 1], [0, width]),
      marginLeft: _mx,
      marginRight: _mx,
    };
  });

  return (
    <View flexDirection="row" height={height} {...props}>
      {fullScreen && (
        <AnimatedView style={fullScreenStyle} overflow="hidden">
          <AnimatedButton
            icon={Maximize2}
            size={buttonSize}
            onPress={fullScreen}
            circular
          />
        </AnimatedView>
      )}
      {start && (
        <AnimatedButton
          icon={Play}
          size={buttonSize}
          onPress={start}
          circular
          mx={mx}
          style={style}
        />
      )}
      {pause && (
        <AnimatedButton
          icon={Pause}
          size={buttonSize}
          onPress={pause}
          circular
          mx={mx}
          style={style}
        />
      )}
      {addMinute && (
        <AnimatedButton
          icon={Plus}
          size={buttonSize}
          onPress={addMinute}
          circular
          mx={mx}
          style={style}
        />
      )}
      {reset && (
        <AnimatedButton
          icon={RefreshCcw}
          size={buttonSize}
          onPress={reset}
          circular
          mx={mx}
          style={style}
        />
      )}
    </View>
  );
});
