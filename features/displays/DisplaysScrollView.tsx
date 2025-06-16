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
import { TimerState } from "@/features-2/timers/types";
import Indicators from "@/features/pagination/Indicators";
import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { Stage } from "@/features/stages/Stage.types";
import { Orientation } from "@/hooks/useOrientation";

const displays: {
  component: React.NamedExoticComponent<DisplayProps>;
  props: Partial<DisplayProps>;
}[] = [
  {
    component: Display,
    props: {
      colorVariant: "border",
      showText: true,
    },
  },
  {
    component: Display,
    props: {
      colorVariant: "background",
      showText: true,
    },
  },
  {
    component: Display,
    props: {
      colorVariant: "background",
      showText: false,
    },
  },
];

const AnimatedView = Animated.createAnimatedComponent(View);

export interface DisplaysScrollViewProps
  extends Omit<ViewProps, "height" | "width" | "start" | "rotate" | "onPress">,
    Pick<DisplayProps, "onPress"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  duration: SharedValue<number | null>;
  stage: Stage;
  start?: () => void;
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
  ...props
}: DisplaysScrollViewProps): React.ReactNode {
  const _rotation = useSharedValue(0);

  const [lockedOrientation, lockOrientation] =
    React.useState<Orientation | null>(null);

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
        {displays.map(({ component: Component, props: componentProps }, i) => (
          <Page key={i} pageWidth={pageWidth}>
            <Component
              stage={stage}
              height={height}
              width={width}
              duration={duration}
              back={goBack}
              onPress={onPress}
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
        z={2}
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
        z={2}
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
