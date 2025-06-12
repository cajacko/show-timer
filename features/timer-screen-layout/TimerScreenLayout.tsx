import NumberPad from "@/features-2/number-pad/NumberPad";
import StageSelector from "@/features-2/stages/StageSelector";
import React from "react";
import { useDerivedValue } from "react-native-reanimated";
import { View, ViewProps } from "tamagui";
import DisplaysScrollView from "@/features/displays/DisplaysScrollView";

export interface TimerScreenLayoutProps
  extends Omit<ViewProps, "height" | "width"> {
  height: number;
  width: number;
}

export default React.memo(function TimerScreenLayout({
  height: heightProp,
  width: widthProp,
  ...props
}: TimerScreenLayoutProps): React.ReactNode {
  const height = useDerivedValue<number>(() => {
    return heightProp / 3;
  });

  const width = useDerivedValue<number>(() => {
    return widthProp;
  });

  return (
    <View flexDirection="column" {...props}>
      <DisplaysScrollView height={height} width={width} pageWidth={widthProp} />
      <StageSelector />
      <View flex={1} items="center" justify="center">
        <NumberPad />
      </View>
    </View>
  );
});
