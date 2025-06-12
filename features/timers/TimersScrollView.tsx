import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ScrollViewProps, SizableText, View, ViewProps } from "tamagui";
import ClockTimer from "./ClockTimer";
import DurationTimer from "./DurationTimer";
import Timer from "./Timer";
import { TimerCommonProps } from "./Timer.types";
import Indicators from "@/features/pagination/Indicators";
import usePagination from "@/features/pagination/usePagination";

export type TimersScrollViewProps = object;

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
const indicatorSize = 15;
const indicatorContainerHeight = indicatorSize + 10;
const landscapeFooterWidth = 300;

function ItemFooter({
  text,
  height,
  ...props
}: { text: string; height: number } & Omit<ViewProps, "text">) {
  return (
    <View height={height} items="center" justify="center" {...props}>
      <SizableText size="$6">{text}</SizableText>
    </View>
  );
}

function useLayout({
  setIntervalWidth,
}: {
  setIntervalWidth: (width: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const height = useSharedValue<number>(Dimensions.get("window").height);
  const width = useSharedValue<number>(Dimensions.get("window").width);
  const [layout, setLayout] = React.useState<"portrait" | "landscape">(() =>
    width.value > height.value ? "landscape" : "portrait"
  );

  const footerHeight = footerContentHeight + insets.bottom;

  const itemHeight = useDerivedValue(() => {
    if (layout === "portrait") {
      return height.value - footerHeight;
    }

    return height.value;
  });

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
          setLayout(newWidth > newHeight ? "landscape" : "portrait");

          resizeTimeout.current = null;
        }, intervalDebounce); // 100ms debounce, tweak to taste
      } else {
        setLayout(newWidth > newHeight ? "landscape" : "portrait");
        setIntervalWidth(newWidth);

        // Block updates for the timeout
        resizeTimeout.current = setTimeout(() => {
          resizeTimeout.current = null;
        }, intervalDebounce); // 100ms debounce, tweak to taste
      }
    },
    [height, width, setIntervalWidth]
  );

  const itemFooterBottomPadding = insets.bottom;

  return {
    insets,
    footerHeight,
    itemHeight,
    width,
    itemFooterBottomPadding,
    onLayout,
    layout,
  };
}

export default React.memo(function TimersScrollView({
  ...props
}: TimersScrollViewProps): React.ReactNode {
  const [pageWidth, setPageWidth] = React.useState(
    Dimensions.get("window").width
  );

  const { ScrollView, previous, next, scrollXOffset, Page } = usePagination({
    pageCount: timers.length,
    pageWidth,
  });

  const layout = useLayout({
    setIntervalWidth: setPageWidth,
  });

  return (
    <View flex={1} {...props}>
      <ScrollView onLayout={layout.onLayout} style={styles.scrollView}>
        {timers.map(({ component: Component, name }, index) => (
          <Page key={index}>
            <Component
              height={layout.itemHeight}
              width={layout.width}
              flex={1}
              layout={layout.layout}
              landscapeFooterHeight={layout.footerHeight}
              landscapeFooterWidth={landscapeFooterWidth}
            />
            <ItemFooter
              text={name}
              pb={layout.itemFooterBottomPadding}
              height={layout.footerHeight}
            />
          </Page>
        ))}
      </ScrollView>
      <View
        flexDirection="row"
        width={layout.layout === "portrait" ? "100%" : landscapeFooterWidth}
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
          pageWidth={pageWidth}
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
