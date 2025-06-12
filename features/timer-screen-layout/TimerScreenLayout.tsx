import NumberPad from "@/features-2/number-pad/NumberPad";
import StageSelector from "@/features-2/stages/StageSelector";
import Timer from "@/features-2/timers/border-timer/BorderTimer";
import { TimerState } from "@/features-2/timers/types";
import React from "react";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { View, ViewProps } from "tamagui";

export interface TimerScreenLayoutProps
  extends Omit<ViewProps, "height" | "width"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
}

export default React.memo(function TimerScreenLayout({
  height: heightProp,
  width,
  ...props
}: TimerScreenLayoutProps): React.ReactNode {
  const duration = useSharedValue<number | null>(60);
  const state = useSharedValue<TimerState>({ type: "stopped" });

  const height = useDerivedValue<number>(() => {
    return heightProp.value / 3;
  });

  return (
    <View flexDirection="column" {...props}>
      <Timer duration={duration} state={state} width={width} height={height} />
      <StageSelector />
      <View flex={1} items="center" justify="center">
        <NumberPad />
      </View>
    </View>
  );
});
