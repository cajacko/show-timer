import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Button, View, ViewProps } from "tamagui";
import Timer, {
  BorderTimerProps,
} from "@/features-2/timers/border-timer/BorderTimer";
import { useScrollablePagination } from "@/features/pagination/usePagination";
import { TimerState } from "@/features-2/timers/types";
import Indicators from "@/features/pagination/Indicators";
import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { Stage } from "@/features/stages/Stage.types";

const displays: {
  component: React.NamedExoticComponent<BorderTimerProps>;
  props: Partial<BorderTimerProps>;
}[] = [
  {
    component: Timer,
    props: {
      colorVariant: "border",
      showText: true,
    },
  },
  {
    component: Timer,
    props: {
      colorVariant: "background",
      showText: true,
    },
  },
  {
    component: Timer,
    props: {
      colorVariant: "background",
      showText: false,
    },
  },
];

const AnimatedView = Animated.createAnimatedComponent(View);

export interface DisplaysScrollViewProps
  extends Omit<ViewProps, "height" | "width" | "start"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  pageWidth: number;
  duration: SharedValue<number | null>;
  stage: Stage;
  start?: () => void;
  fullScreenAmount: SharedValue<number>;
}

export default React.memo(function DisplaysScrollView({
  height,
  width,
  pageWidth,
  duration,
  stage,
  start,
  fullScreenAmount,
  ...props
}: DisplaysScrollViewProps): React.ReactNode {
  const enableScrollSharedValue = useDerivedValue<boolean>(
    () => fullScreenAmount.value === 0
  );

  const { ScrollView, Page, scrollXOffset, previous, next } =
    useScrollablePagination({
      pageCount: displays.length,
      pageWidth,
      enableScrollSharedValue,
    });

  const state = useSharedValue<TimerState>({ type: "stopped" });

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

  return (
    <View {...props}>
      <ScrollView>
        {displays.map(({ component: Component, props: componentProps }, i) => (
          <Page key={i}>
            <Component
              stage={stage}
              height={height}
              width={width}
              duration={duration}
              state={state}
              start={start}
              {...componentProps}
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
      >
        <Button icon={ChevronLeft} size="$5" circular onPress={previous} />
      </AnimatedView>
      <AnimatedView
        position="absolute"
        r="$space.2"
        b={0}
        t={0}
        items="center"
        justify="center"
        style={rightChevronStyle}
      >
        <Button icon={ChevronRight} size="$5" circular onPress={next} />
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
      >
        <Indicators
          b={0}
          pageCount={displays.length}
          scrollX={scrollXOffset}
          pageWidth={pageWidth}
        />
      </AnimatedView>
    </View>
  );
});
