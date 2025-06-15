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
import {
  Page,
  ScrollView,
  usePaginationControls,
} from "@/features/pagination/usePagination";
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
  extends Omit<ViewProps, "height" | "width" | "start" | "rotate"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  duration: SharedValue<number | null>;
  stage: Stage;
  start?: () => void;
  fullScreenAmount: SharedValue<number>;
}

export default React.memo(function DisplaysScrollView({
  height,
  width,
  duration,
  stage,
  start,
  fullScreenAmount,
  ...props
}: DisplaysScrollViewProps): React.ReactNode {
  const _rotation = useSharedValue(0);

  const rotation = useDerivedValue(() => {
    if (fullScreenAmount.value === 0) return 0;

    return _rotation.value;

    // return _rotation.value * fullScreenAmount.value;
  });

  const rotate = React.useCallback(async () => {
    if (_rotation.value === 0) {
      _rotation.value = 90; // Start rotation at 90 degrees
    } else if (_rotation.value === 90) {
      _rotation.value = 180; // Rotate to 180 degrees
    } else if (_rotation.value === 180) {
      _rotation.value = 270; // Rotate to 270 degrees
    } else {
      _rotation.value = 0; // Reset to 0 degrees
    }
  }, [_rotation]);

  const enableScrollSharedValue = useDerivedValue<boolean>(
    () => fullScreenAmount.value === 0
  );

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

  const pageCount = displays.length;
  const pageWidth = width;

  const scrollXOffset = useSharedValue(0); // only use internally

  const { next, previous } = usePaginationControls({
    pageCount,
    pageWidth,
    scrollXOffset,
    scrollXControl: scrollXOffset,
    enableScrollSharedValue,
  });

  return (
    <View {...props} overflow="hidden">
      <ScrollView
        pageCount={pageCount}
        pageWidth={pageWidth}
        scrollXOffset={scrollXOffset}
        enableScrollSharedValue={enableScrollSharedValue}
      >
        {displays.map(({ component: Component, props: componentProps }, i) => (
          <Page key={i} pageWidth={pageWidth}>
            <Component
              stage={stage}
              height={height}
              width={width}
              duration={duration}
              state={state}
              start={start}
              rotate={rotate}
              rotation={rotation}
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
          pageWidth={width}
        />
      </AnimatedView>
    </View>
  );
});
