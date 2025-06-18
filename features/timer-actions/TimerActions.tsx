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
  useDerivedValue,
} from "react-native-reanimated";
import { View, ViewProps, Button } from "tamagui";

const AnimatedButton = Animated.createAnimatedComponent(Button);

export interface TimerActionsProps
  extends Omit<ViewProps, "start" | "visibility"> {
  fullScreen?: () => void;
  start?: () => void;
  pause?: () => void;
  addMinute?: () => void;
  reset?: () => void;
  visibility?: SharedValue<number>;
}

const mx = "$space.2";

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

  return (
    <View flexDirection="row" {...props}>
      {fullScreen && (
        <AnimatedButton
          icon={Maximize2}
          size="$5"
          onPress={fullScreen}
          circular
          mx={mx}
        />
      )}
      {start && (
        <AnimatedButton
          icon={Play}
          size="$5"
          onPress={start}
          circular
          mx={mx}
          style={style}
        />
      )}
      {pause && (
        <AnimatedButton
          icon={Pause}
          size="$5"
          onPress={pause}
          circular
          mx={mx}
          style={style}
        />
      )}
      {addMinute && (
        <AnimatedButton
          icon={Plus}
          size="$5"
          onPress={addMinute}
          circular
          mx={mx}
          style={style}
        />
      )}
      {reset && (
        <AnimatedButton
          icon={RefreshCcw}
          size="$5"
          onPress={reset}
          circular
          mx={mx}
          style={style}
        />
      )}
    </View>
  );
});
