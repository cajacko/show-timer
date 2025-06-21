import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Button, View, ViewProps } from "tamagui";
import Display, { DisplayProps } from "@/features/displays/Display";
import {
  Page,
  ScrollState,
  ScrollView,
  usePaginationControls,
} from "@/features/pagination/usePagination";
import Indicators from "@/features/pagination/Indicators";
import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { Stage } from "@/features/stages/Stage.types";
import { useTimerActionSize } from "@/features/timer-actions/TimerActions";

const displays: Partial<DisplayProps>[] = [
  {
    colorVariant: "border",
    showText: true,
    debug: true,
  },
  {
    colorVariant: "background",
    showText: true,
  },
  {
    colorVariant: "background",
    showText: false,
  },
];

const AnimatedView = Animated.createAnimatedComponent(View);

export interface DisplaysScrollViewProps
  extends Omit<
      ViewProps,
      "height" | "width" | "start" | "rotate" | "onPress" | "debug"
    >,
    Pick<
      DisplayProps,
      | "onPress"
      | "flash"
      | "pause"
      | "reset"
      | "addMinute"
      | "start"
      | "running"
      | "type"
      | "fullScreen"
      | "debug"
      | "secondsVariant"
    > {
  height: SharedValue<number>;
  width: SharedValue<number>;
  duration: SharedValue<number | null>;
  stage: Stage;
  goBack: () => void;
  fullScreenAmount: SharedValue<number>;
}

export default React.memo(function DisplaysScrollView({
  height,
  width,
  duration,
  stage,
  start,
  goBack,
  fullScreenAmount,
  onPress,
  flash = false,
  pause,
  reset,
  addMinute,
  running,
  type,
  fullScreen,
  debug = false,
  secondsVariant,
  ...props
}: DisplaysScrollViewProps): React.ReactNode {
  const { buttonSize } = useTimerActionSize();

  const enableScrollSharedValue = useDerivedValue<boolean>(
    () => fullScreenAmount.value === 0
  );

  const leftChevronStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - fullScreenAmount.value,
      transform: [
        {
          translateX: fullScreenAmount.value * -100, // Move left when in full screen
        },
      ],
    };
  });

  const rightChevronStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - fullScreenAmount.value,
      transform: [
        {
          translateX: fullScreenAmount.value * 100, // Move right when in full screen
        },
      ],
    };
  });

  const indicatorsStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - fullScreenAmount.value,
      transform: [
        {
          translateY: fullScreenAmount.value * 100, // Move down when in full screen
        },
      ],
    };
  });

  const pageCount = displays.length;
  const pageWidth = width;

  const scrollXOffset = useSharedValue(0);
  const scrollState = useSharedValue<ScrollState>("idle");

  const { next, previous } = usePaginationControls({
    scrollState,
    pageCount,
    pageWidth,
    scrollXOffset,
    scrollXControl: scrollXOffset,
    enableScrollSharedValue,
  });

  return (
    <View {...props} overflow="hidden">
      <ScrollView
        scrollState={scrollState}
        pageCount={pageCount}
        pageWidth={pageWidth}
        scrollXOffset={scrollXOffset}
        enableScrollSharedValue={enableScrollSharedValue}
      >
        {displays.map((componentProps, i) => (
          <Page key={i} pageWidth={pageWidth}>
            <Display
              stage={stage}
              height={height}
              width={width}
              duration={duration}
              back={goBack}
              onPress={onPress}
              fullScreenAmount={fullScreenAmount}
              flash={flash}
              start={start}
              pause={pause}
              reset={reset}
              addMinute={addMinute}
              running={running}
              type={type}
              fullScreen={fullScreen}
              secondsVariant={secondsVariant}
              {...componentProps}
              debug={!!debug && !!componentProps.debug}
            />
          </Page>
        ))}
      </ScrollView>
      <AnimatedView
        position="absolute"
        t={0}
        l="$space.2"
        b={0}
        items="center"
        justify="center"
        style={leftChevronStyle}
        z={2}
      >
        <Button
          icon={ChevronLeft}
          size={buttonSize}
          circular
          onPress={previous}
        />
      </AnimatedView>
      <AnimatedView
        position="absolute"
        r="$space.2"
        b={0}
        t={0}
        items="center"
        justify="center"
        style={rightChevronStyle}
        z={2}
      >
        <Button icon={ChevronRight} size={buttonSize} circular onPress={next} />
      </AnimatedView>
      <AnimatedView
        position="absolute"
        width="100%"
        b="$space.2"
        l={0}
        r={0}
        items="center"
        justify="center"
        style={indicatorsStyle}
        z={2}
      >
        <Indicators
          b={0}
          pageCount={displays.length}
          scrollX={scrollXOffset}
          pageWidth={width}
        />
      </AnimatedView>
    </View>
  );
});
