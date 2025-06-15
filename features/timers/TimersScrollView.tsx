import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import React from "react";
import { Dimensions, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ScrollViewProps, View } from "tamagui";
import ClockTimer from "./ClockTimer";
import DurationTimer from "./DurationTimer";
import Timer from "./Timer";
import { TimerCommonProps } from "./Timer.types";
import Indicators from "@/features/pagination/Indicators";
import {
  Page,
  ScrollState,
  ScrollView,
  usePaginationControls,
} from "@/features/pagination/usePagination";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useKeepAwake } from "expo-keep-awake";

export type TimersScrollViewProps = object;

const timers: {
  component: React.NamedExoticComponent<TimerCommonProps>;
  name: string;
  description: string;
}[] = [
  {
    component: ClockTimer,
    name: "Clock",
    description: "It's a clock, it shows the time",
  },
  { component: Timer, name: "Timer", description: "Count up from 0" },
  {
    component: DurationTimer,
    name: "Duration",
    description: "Count down from a set duration",
  },
];

const footerContentHeight = 100;
const indicatorSize = 15;
const indicatorContainerHeight = indicatorSize + 10;

const AnimatedView = Animated.createAnimatedComponent(View);

function useLayout() {
  const fullScreenAmount = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const width = useSharedValue(Dimensions.get("window").width);
  const height = useSharedValue(Dimensions.get("window").height);

  const footerHeight = footerContentHeight + insets.bottom;

  const onLayout = React.useCallback<NonNullable<ScrollViewProps["onLayout"]>>(
    (event) => {
      const { height: newHeight, width: newWidth } = event.nativeEvent.layout;

      height.value = newHeight;
      width.value = newWidth;
    },
    [height, width]
  );

  const itemFooterBottomPadding = insets.bottom;

  const footerStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - fullScreenAmount.value,
      transform: [
        {
          translateY: fullScreenAmount.value * footerContentHeight,
        },
      ],
    };
  });

  return {
    height,
    width,
    footerStyle,
    insets,
    footerHeight,
    itemFooterBottomPadding,
    onLayout,
    fullScreenAmount,
  };
}

export default React.memo(function TimersScrollView({
  ...props
}: TimersScrollViewProps): React.ReactNode {
  // This is okay as we can't switch platforms at runtime
  if (Platform.OS !== "web") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeepAwake();
  }

  const { fullScreenAmount, ...layout } = useLayout();

  const enableScrollSharedValue = useDerivedValue<boolean>(
    () => fullScreenAmount.value === 0
  );

  const pageCount = timers.length;
  const pageWidth = layout.width;

  const scrollXOffset = useSharedValue(0);
  const scrollState = useSharedValue<ScrollState>("idle");

  const { next, previous } = usePaginationControls({
    pageCount,
    pageWidth,
    scrollXOffset,
    scrollXControl: scrollXOffset,
    enableScrollSharedValue,
    scrollState,
  });

  return (
    <View flex={1} onLayout={layout.onLayout} {...props}>
      <ScrollView
        scrollState={scrollState}
        style={styles.scrollView}
        pageCount={pageCount}
        pageWidth={pageWidth}
        scrollXOffset={scrollXOffset}
        enableScrollSharedValue={enableScrollSharedValue}
      >
        {timers.map(({ component: Component, name, description }, index) => (
          <Page key={index} pageWidth={pageWidth}>
            <Component
              height={layout.height}
              width={layout.width}
              flex={1}
              fullScreenAmount={fullScreenAmount}
              title={name}
              description={description}
              footerHeight={layout.footerHeight}
              footerPb={layout.itemFooterBottomPadding}
            />
          </Page>
        ))}
      </ScrollView>
      <AnimatedView
        flexDirection="row"
        width="100%"
        justify="space-between"
        height={layout.footerHeight}
        items="center"
        position="absolute"
        b={0}
        l={0}
        r={0}
        px="$space.2"
        pb={layout.insets.bottom}
        style={layout.footerStyle}
      >
        <Button
          icon={ChevronLeft}
          size="$5"
          variant="outlined"
          circular
          onPress={previous}
        />
        <Indicators
          flex={1}
          self="flex-end"
          height={indicatorContainerHeight}
          size={indicatorSize}
          scrollX={scrollXOffset}
          pageWidth={layout.width}
          pageCount={timers.length}
        />
        <Button
          icon={ChevronRight}
          size="$5"
          variant="outlined"
          circular
          onPress={next}
        />
      </AnimatedView>
    </View>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
