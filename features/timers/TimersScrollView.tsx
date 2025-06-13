import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ScrollViewProps, SizableText, View, ViewProps } from "tamagui";
import ClockTimer from "./ClockTimer";
import DurationTimer from "./DurationTimer";
import Timer from "./Timer";
import { TimerCommonProps } from "./Timer.types";
import Indicators from "@/features/pagination/Indicators";
import { useControlledPagination } from "@/features/pagination/usePagination";

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

const intervalDebounce = 100; // 100ms debounce, tweak to taste
const footerContentHeight = 100;
const indicatorSize = 15;
const indicatorContainerHeight = indicatorSize + 10;

function ItemFooter({
  title,
  description,
  height,
  ...props
}: { title: string; description: string; height: number } & Omit<
  ViewProps,
  "text"
>) {
  return (
    <View height={height} items="center" justify="center" {...props}>
      <SizableText size="$6">{title}</SizableText>
      <SizableText size="$2">{description}</SizableText>
    </View>
  );
}

function useLayout() {
  const insets = useSafeAreaInsets();
  const [size, setSize] = React.useState({
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
  });

  const footerHeight = footerContentHeight + insets.bottom;

  const sizeRef = React.useRef(size);
  const resizeTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const onLayout = React.useCallback<NonNullable<ScrollViewProps["onLayout"]>>(
    (event) => {
      const { height: newHeight, width: newWidth } = event.nativeEvent.layout;

      sizeRef.current = {
        height: newHeight,
        width: newWidth,
      };

      /**
       * Updates with the latest values which are always the reanimated values
       */
      function update() {
        setSize(sizeRef.current);

        resizeTimeout.current = null;
      }

      if (!resizeTimeout.current) {
        update();

        resizeTimeout.current = setTimeout(update, intervalDebounce);
      }
    },
    []
  );

  const itemFooterBottomPadding = insets.bottom;

  return {
    ...size,
    insets,
    footerHeight,
    itemFooterBottomPadding,
    onLayout,
  };
}

export default React.memo(function TimersScrollView({
  ...props
}: TimersScrollViewProps): React.ReactNode {
  const layout = useLayout();

  const { ControlledScrollView, previous, next, scrollXOffset, Page } =
    useControlledPagination({
      pageCount: timers.length,
      pageWidth: layout.width,
    });

  return (
    <View flex={1} {...props}>
      <ControlledScrollView
        onLayout={layout.onLayout}
        style={styles.scrollView}
      >
        {timers.map(({ component: Component, name, description }, index) => (
          <Page key={index}>
            <Component height={layout.height} width={layout.width} flex={1} />
            <ItemFooter
              title={name}
              description={description}
              pb={layout.itemFooterBottomPadding}
              height={layout.footerHeight}
            />
          </Page>
        ))}
      </ControlledScrollView>
      <View
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
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
