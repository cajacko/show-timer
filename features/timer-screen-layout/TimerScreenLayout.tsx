import NumberPad from "@/features/number-pad/NumberPad";
import StageSelector, {
  Stage,
  StageSelectorProps,
} from "@/features/stages/StageSelector";
import React from "react";
import { useDerivedValue } from "react-native-reanimated";
import { View, ViewProps } from "tamagui";
import DisplaysScrollView, {
  DisplaysScrollViewProps,
} from "@/features/displays/DisplaysScrollView";
import stageColors from "@/features/stages/stageColors";

export interface TimerScreenLayoutProps
  extends Pick<StageSelectorProps, "okayValue" | "warningValue" | "alertValue">,
    Omit<ViewProps, "height" | "width">,
    Pick<DisplaysScrollViewProps, "duration" | "stage"> {
  height: number;
  width: number;
  selectedStage?: Stage;
  onChangeSelectedStage?: StageSelectorProps["onChange"];
}

export default React.memo(function TimerScreenLayout({
  height: heightProp,
  width: widthProp,
  selectedStage,
  okayValue,
  warningValue,
  alertValue,
  onChangeSelectedStage,
  duration,
  stage,
  ...props
}: TimerScreenLayoutProps): React.ReactNode {
  const height = useDerivedValue<number>(() => {
    return heightProp / 3;
  });

  const width = useDerivedValue<number>(() => {
    return widthProp;
  });

  const stageColor = selectedStage ? stageColors[selectedStage] : undefined;

  return (
    <View flexDirection="column" {...props}>
      <DisplaysScrollView
        height={height}
        width={width}
        pageWidth={widthProp}
        duration={duration}
        stage={stage}
      />
      <StageSelector
        okayValue={okayValue}
        warningValue={warningValue}
        alertValue={alertValue}
        active={selectedStage}
        onChange={onChangeSelectedStage}
        activePosition="bottom"
        my="$space.4"
      />
      <View flex={1} items="center" justify="center">
        <NumberPad borderColor={stageColor} />
      </View>
    </View>
  );
});
