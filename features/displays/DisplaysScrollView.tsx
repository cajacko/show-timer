import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  clamp,
  interpolate,
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
  extends Omit<ViewProps, "height" | "width" | "start" | "rotate"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  pageWidth: number;
  duration: SharedValue<number | null>;
  stage: Stage;
  start?: () => void;
  fullScreenAmount: SharedValue<number>;
}

export default React.memo(function DisplaysScrollView({
  height: heightProp,
  width: widthProp,
  pageWidth,
  duration,
  stage,
  start,
  fullScreenAmount,
  ...props
}: DisplaysScrollViewProps): React.ReactNode {
  const _rotation = useSharedValue(0);

  const rotate = React.useCallback(() => {
    if (_rotation.value >= 360) {
      _rotation.value = 0; // Reset rotation after a full circle
    }

    _rotation.value = withTiming(
      clamp(_rotation.value + 90, 0, 360),
      {},
      () => {
        if (_rotation.value >= 360) {
          _rotation.value = 0; // Reset rotation after a full circle
        }
      }
    );
  }, [_rotation]);

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

  const rotation = useDerivedValue(() => {
    if (fullScreenAmount.value === 0) return 0;

    return _rotation.value;

    // return _rotation.value * fullScreenAmount.value;
  });

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  /**
   * Figure out our orientation percentage based on the rotation. 0, 180, 360 are portrait, and 90,
   * 270 are landscape. This returns a range e.g. 0.5 is half way between portrait and landscape.
   *
   * 0 is portrait
   * 1 is landscape
   */
  const orientation = useDerivedValue<number>(() => {
    if (
      rotation.value === 0 ||
      rotation.value === 180 ||
      rotation.value === 360
    ) {
      return 0; // Portrait
    } else if (rotation.value === 90 || rotation.value === 270) {
      return 1; // Landscape
    }
    // Between portrait and landscape
    return rotation.value < 180
      ? rotation.value / 180
      : (360 - rotation.value) / 180;
  });

  const height = useDerivedValue<number>(() => {
    return interpolate(
      orientation.value,
      [0, 1],
      [heightProp.value, widthProp.value]
    );
  });

  const width = useDerivedValue(() => {
    return interpolate(
      orientation.value,
      [0, 1],
      [widthProp.value, heightProp.value]
    );
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      height: heightProp.value,
      width: widthProp.value,
    };
  });

  return (
    <AnimatedView
      {...props}
      overflow="hidden"
      style={containerStyle}
      borderColor="$black12"
      borderWidth={1}
    >
      <AnimatedView style={rotationStyle}>
        <ScrollView>
          {displays.map(
            ({ component: Component, props: componentProps }, i) => (
              <Page key={i}>
                <Component
                  stage={stage}
                  height={height}
                  width={width}
                  duration={duration}
                  state={state}
                  start={start}
                  rotate={rotate}
                  {...componentProps}
                />
              </Page>
            )
          )}
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
      </AnimatedView>
    </AnimatedView>
  );
});
