import NumberPad, { NumberPadProps } from "@/features/number-pad/NumberPad";
import StageSelector, {
  Stage,
  StageSelectorProps,
} from "@/features/stages/StageSelector";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  clamp,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { SizableText, View, ViewProps } from "tamagui";
import DisplaysScrollView, {
  DisplaysScrollViewProps,
} from "@/features/displays/DisplaysScrollView";
import stageColors from "@/features/stages/stageColors";

const AnimatedView = Animated.createAnimatedComponent(View);
export interface TimerScreenLayoutProps
  extends Pick<StageSelectorProps, "okayValue" | "warningValue" | "alertValue">,
    Omit<ViewProps, "height" | "width">,
    Pick<DisplaysScrollViewProps, "duration" | "stage"> {
  height: number;
  width: number;
  selectedStage?: Stage;
  onChangeSelectedStage?: StageSelectorProps["onChange"];
  onNumberPadAction?: NumberPadProps["onAction"];
  stageButtonVariant?: StageSelectorProps["variant"];
  /**
   * 0 means the display will show at the collapsed height, 1 will show at the full height
   */
  fullScreenAmount: SharedValue<number>;
  title: string;
  description: string;
  footerHeight: number;
  footerPb?: number;
}

export default React.memo(function TimerScreenLayout({
  height,
  width: widthProp,
  selectedStage,
  okayValue,
  warningValue,
  alertValue,
  onChangeSelectedStage,
  duration,
  stage,
  onNumberPadAction,
  stageButtonVariant,
  fullScreenAmount,
  title,
  description,
  footerHeight,
  footerPb,
  ...props
}: TimerScreenLayoutProps): React.ReactNode {
  const collapsedDisplayHeight = useDerivedValue<number>(() => {
    return height / 3;
  });

  /**
   * 0 - show the collapsedDisplayHeight
   * 1 - will be equal to height
   */
  const displayHeight = useDerivedValue<number>(() => {
    return clamp(
      collapsedDisplayHeight.value +
        (height - collapsedDisplayHeight.value) * fullScreenAmount.value,
      collapsedDisplayHeight.value,
      height
    );
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      height: height - collapsedDisplayHeight.value,
    };
  });

  const width = useDerivedValue<number>(() => {
    return widthProp;
  });

  const stageColor = selectedStage ? stageColors[selectedStage] : undefined;

  const fullScreen = React.useRef<boolean>(false);

  const start = React.useCallback(() => {
    fullScreen.current = !fullScreen.current;

    fullScreenAmount.value = withTiming(fullScreen.current ? 1 : 0, {
      duration: 300,
    });
  }, [fullScreenAmount]);

  return (
    <View flexDirection="column" overflow="hidden" {...props}>
      <DisplaysScrollView
        height={displayHeight}
        width={width}
        pageWidth={widthProp}
        duration={duration}
        stage={stage}
        start={start}
        fullScreenAmount={fullScreenAmount}
      />
      <AnimatedView style={contentStyle} justify="space-between">
        <StageSelector
          okayValue={okayValue}
          warningValue={warningValue}
          alertValue={alertValue}
          active={selectedStage}
          onChange={onChangeSelectedStage}
          activePosition="bottom"
          my="$space.4"
          variant={stageButtonVariant}
        />
        <View items="center" justify="center">
          <NumberPad borderColor={stageColor} onAction={onNumberPadAction} />
        </View>
        <View
          items="center"
          justify="center"
          height={footerHeight}
          pb={footerPb}
        >
          <SizableText size="$6">{title}</SizableText>
          <SizableText size="$2">{description}</SizableText>
        </View>
      </AnimatedView>
    </View>
  );
});
