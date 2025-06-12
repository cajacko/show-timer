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
  layout: "portrait" | "landscape";
  landscapeFooterHeight: number;
  landscapeFooterWidth: number;
}

export default React.memo(function TimerScreenLayout({
  height: heightProp,
  width: widthProp,
  layout,
  landscapeFooterHeight,
  landscapeFooterWidth,
  ...props
}: TimerScreenLayoutProps): React.ReactNode {
  const duration = useSharedValue<number | null>(60);
  const state = useSharedValue<TimerState>({ type: "stopped" });

  const width = useDerivedValue(() => {
    if (layout === "portrait") {
      return widthProp.value;
    }

    return (widthProp.value - landscapeFooterWidth) / 2;
  });

  const height = useDerivedValue<number>(() => {
    if (layout === "portrait") {
      return heightProp.value / 3;
    }

    return heightProp.value;
  });

  return (
    <View flexDirection={layout === "landscape" ? "row" : "column"} {...props}>
      <Timer duration={duration} state={state} width={width} height={height} />
      <View width={layout === "landscape" ? landscapeFooterWidth : "100%"}>
        <StageSelector />
      </View>
      <View flex={1} items="center" justify="center">
        <NumberPad />
      </View>
    </View>
  );
});
