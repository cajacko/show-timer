import {
  Maximize2,
  Pause,
  Play,
  Plus,
  RefreshCcw,
} from "@tamagui/lucide-icons";
import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { View, ViewProps, Button } from "tamagui";

const AnimatedButton = Animated.createAnimatedComponent(Button);

const mx = "$space.2";

export interface TimerActionsProps
  extends Omit<ViewProps, "start" | "visibility"> {
  fullScreen?: () => void;
  start?: () => void;
  pause?: () => void;
  addMinute?: () => void;
  reset?: () => void;
  visibility?: SharedValue<number>;
}

export function useTimerActionSize(): {
  buttonSize: "$5";
  height: number;
} {
  return {
    buttonSize: "$5",
    height: 40, // Assuming $5 corresponds to a height of 40px
  };
}

export default React.memo(function TimerActions({
  fullScreen,
  start,
  pause,
  addMinute,
  reset,
  visibility,
  ...props
}: TimerActionsProps): React.ReactNode {
  const style = useAnimatedStyle(() => ({
    opacity: visibility ? visibility.value : 1,
    transform: [{ scale: visibility ? visibility.value : 1 }],
  }));

  const { buttonSize, height } = useTimerActionSize();

  return (
    <View flexDirection="row" height={height} {...props}>
      {fullScreen && (
        <AnimatedButton
          icon={Maximize2}
          size={buttonSize}
          onPress={fullScreen}
          circular
          mx={mx}
        />
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
