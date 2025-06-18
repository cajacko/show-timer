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
import TimerActions from "@/features/timer-actions/TimerActions";

const AnimatedView = Animated.createAnimatedComponent(View);
export interface TimerScreenLayoutProps
  extends Pick<StageSelectorProps, "okayValue" | "warningValue" | "alertValue">,
    Omit<ViewProps, "height" | "width" | "start">,
    Pick<DisplaysScrollViewProps, "duration" | "stage"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  selectedStage?: Stage;
  onChangeSelectedStage?: StageSelectorProps["onChange"];
  onNumberPadAction?: NumberPadProps["onAction"];
  stageButtonVariant?: StageSelectorProps["variant"];
  onPressDisplay?: DisplaysScrollViewProps["onPress"];
  disabledButtons?: NumberPadProps["disabledButtons"];
  /**
   * 0 means the display will show at the collapsed height, 1 will show at the full height
   */
  fullScreenAmount: SharedValue<number>;
  title: string;
  description: string;
  footerHeight: number;
  footerPb?: number;
  start?: () => void;
  pause?: () => void;
  reset?: () => void;
  addMinute?: () => void;
  fullScreenButton?: boolean;
}

export const fullScreenDuration = 300;

export default React.memo(function TimerScreenLayout({
  height,
  width,
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
  onPressDisplay,
  disabledButtons,
  start: startProp,
  fullScreenButton,
  pause,
  reset,
  addMinute,
  ...props
}: TimerScreenLayoutProps): React.ReactNode {
  const collapsedDisplayHeight = useDerivedValue<number>(() => {
    return height.value / 3;
  });

  /**
   * 0 - show the collapsedDisplayHeight
   * 1 - will be equal to height
   */
  const displayHeight = useDerivedValue<number>(() => {
    return clamp(
      collapsedDisplayHeight.value +
        (height.value - collapsedDisplayHeight.value) * fullScreenAmount.value,
      collapsedDisplayHeight.value,
      height.value
    );
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      height: height.value - collapsedDisplayHeight.value,
    };
  });

  const stageColor = selectedStage ? stageColors[selectedStage] : undefined;

  const fullScreenRef = React.useRef<boolean>(false);

  const fullScreen = React.useCallback(() => {
    fullScreenRef.current = true;

    fullScreenAmount.value = withTiming(1, {
      duration: fullScreenDuration,
    });
  }, [fullScreenAmount]);

  const start = React.useMemo(() => {
    if (!startProp) return undefined;

    return () => {
      startProp();
      fullScreen();
    };
  }, [fullScreen, startProp]);

  const goBack = React.useCallback(() => {
    fullScreenRef.current = false;

    fullScreenAmount.value = withTiming(0, {
      duration: fullScreenDuration,
    });
  }, [fullScreenAmount]);

  const startStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - fullScreenAmount.value,
      transform: [
        {
          translateY: `${fullScreenAmount.value * 100}%`,
        },
      ],
    };
  });

  return (
    <View flexDirection="column" overflow="hidden" {...props}>
      <View position="relative">
        <DisplaysScrollView
          height={displayHeight}
          width={width}
          duration={duration}
          stage={stage}
          fullScreenAmount={fullScreenAmount}
          goBack={goBack}
          z={1}
          onPress={onPressDisplay}
        />
        <AnimatedView
          position="absolute"
          r={0}
          z={2}
          b={0}
          l={0}
          t={0}
          pointerEvents="box-none"
          items="center"
          justify="flex-end"
          style={startStyle}
        >
          <TimerActions
            start={start}
            fullScreen={fullScreenButton ? fullScreen : undefined}
            pause={pause}
            reset={reset}
            addMinute={addMinute}
            mb="$space.6"
          />
        </AnimatedView>
      </View>
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
          <NumberPad
            borderColor={stageColor}
            onAction={onNumberPadAction}
            disabledButtons={disabledButtons}
          />
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
