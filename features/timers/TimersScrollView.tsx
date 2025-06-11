import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import React from "react";
import { Dimensions } from "react-native";
import Animated, {
  scrollTo,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Circle,
  ScrollViewProps,
  SizableText,
  View,
  ViewProps,
} from "tamagui";
import ClockTimer from "./ClockTimer";
import DurationTimer from "./DurationTimer";
import Timer from "./Timer";
import { TimerCommonProps } from "./Timer.types";

const AnimatedView = Animated.createAnimatedComponent(View);

export interface TimersScrollViewProps extends ViewProps {}

const timers: {
  component: React.NamedExoticComponent<TimerCommonProps>;
  name: string;
}[] = [
  { component: Timer, name: "Timer" },
  { component: DurationTimer, name: "Duration" },
  { component: ClockTimer, name: "Clock" },
];

const intervalDebounce = 100; // 100ms debounce, tweak to taste
const footerContentHeight = 100;
const scrollDuration = 500;
const indicatorSize = 15;
const indicatorContainerHeight = indicatorSize + 10;

function ItemFooter({
  text,
  height,
  ...props
}: { text: string; height: number } & Omit<ViewProps, "text">) {
  return (
    <View
      height={height}
      borderWidth={1}
      borderColor="$borderColor"
      items="center"
      justify="center"
      {...props}
    >
      <SizableText size="$6">{text}</SizableText>
    </View>
  );
}

export default React.memo(function TimersScrollView({
  ...props
}: TimersScrollViewProps): React.ReactNode {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);

  useDerivedValue(() => {
    scrollTo(scrollViewRef, scrollX.value, 0, true);
  });

  const [intervalWidth, setIntervalWidth] = React.useState<number>(
    Dimensions.get("window").width
  );

  const height = useSharedValue<number>(Dimensions.get("window").height);

  const footerHeight = footerContentHeight + insets.bottom;

  const itemHeight = useDerivedValue(() => height.value - footerHeight);

  const width = useSharedValue<number>(Dimensions.get("window").width);

  const resizeTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const onLayout = React.useCallback<NonNullable<ScrollViewProps["onLayout"]>>(
    (event) => {
      const { height: newHeight, width: newWidth } = event.nativeEvent.layout;

      height.value = newHeight;
      width.value = newWidth;

      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);

        resizeTimeout.current = setTimeout(() => {
          setIntervalWidth(newWidth);
          resizeTimeout.current = null;
        }, intervalDebounce); // 100ms debounce, tweak to taste
      } else {
        setIntervalWidth(newWidth);

        // Block updates for the timeout
        resizeTimeout.current = setTimeout(() => {
          resizeTimeout.current = null;
        }, intervalDebounce); // 100ms debounce, tweak to taste
      }
    },
    [height, width]
  );

  const itemStyle = useAnimatedStyle(() => ({
    height: itemHeight.value + footerHeight,
    width: width.value,
  }));

  const onPressLeft = React.useCallback(() => {
    const offset = scrollX.value - intervalWidth;

    scrollX.value = withTiming(offset < 0 ? 0 : offset, {
      duration: scrollDuration, // Adjust the duration as needed
    });
  }, [intervalWidth, scrollX]);

  const onPressRight = React.useCallback(() => {
    const offset = scrollX.value + intervalWidth;

    scrollX.value = withTiming(
      offset > intervalWidth * 2 ? intervalWidth * 2 : offset,
      {
        duration: scrollDuration, // Adjust the duration as needed
      }
    );
  }, [intervalWidth, scrollX]);

  const itemFooterBottomPadding = insets.bottom;

  return (
    <View flex={1} {...props}>
      <Animated.ScrollView
        onLayout={onLayout}
        style={{ flex: 1 }}
        horizontal
        snapToInterval={intervalWidth}
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {timers.map(({ component: Component, name }, index) => (
          <AnimatedView key={index} style={itemStyle}>
            <Component height={itemHeight} width={width} flex={1} />
            <ItemFooter
              text={name}
              pb={itemFooterBottomPadding}
              height={footerHeight}
            />
          </AnimatedView>
        ))}
      </Animated.ScrollView>
      <View
        flexDirection="row"
        width="100%"
        justify="space-between"
        height={footerHeight}
        items="center"
        borderWidth={1}
        borderColor="$borderColor"
        position="absolute"
        b={0}
        l={0}
        r={0}
        px="$space.2"
        pb={insets.bottom}
      >
        <Button
          icon={ChevronLeft}
          size="$5"
          variant="outlined"
          circular
          onPress={onPressLeft}
        />
        <View
          flex={1}
          items="center"
          flexDirection="row"
          justify="center"
          height={indicatorContainerHeight}
          self="flex-end"
        >
          {timers.map((_, index) => {
            return (
              <Circle
                key={index}
                size={indicatorSize}
                style={{ backgroundColor: "white" }}
                mx="$space.2"
              />
            );
          })}
        </View>
        <Button
          icon={ChevronRight}
          size="$5"
          variant="outlined"
          circular
          onPress={onPressRight}
        />
      </View>
    </View>
  );
});
