import React from "react";
import Animated, {
  clamp,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Platform, ViewProps as RNViewProps } from "react-native";
import { View, ViewProps } from "tamagui";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

const AnimatedView = Animated.createAnimatedComponent(View);

const underScrollPercentage = 0.33; // Percentage of the page width to allow under-scrolling
const fastEnoughVelocity = 2500; // Arbitrary threshold for "fast enough" scrolling

export interface ScrollViewProps extends RNViewProps {
  pageWidth: number | SharedValue<number>;
  scrollXOffset: SharedValue<number>;
  pageCount: number;
  enableScrollSharedValue: SharedValue<boolean>;
}

export const ScrollView = React.memo(function ScrollView({
  children,
  pageWidth,
  scrollXOffset,
  pageCount,
  style: styleProp,
  enableScrollSharedValue,
  ...props
}: ScrollViewProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const width = typeof pageWidth === "number" ? pageWidth : pageWidth.value;
    return {
      width,
      minWidth: width,
      maxWidth: width,
    };
  });

  const style = React.useMemo(() => {
    return [animatedStyle, styleProp];
  }, [animatedStyle, styleProp]);

  const leftSpacerStyle = useAnimatedStyle(() => {
    const width = typeof pageWidth === "number" ? pageWidth : pageWidth.value;

    const remainingWidth = (pageCount - 1) * width - scrollXOffset.value;
    return {
      width: remainingWidth,
    };
  });

  const rightSpacerStyle = useAnimatedStyle(() => {
    return {
      width: scrollXOffset.value,
    };
  });

  const getPageIndex = React.useCallback(() => {
    const pageWidthValue =
      typeof pageWidth === "number" ? pageWidth : pageWidth.value;

    return Math.round(scrollXOffset.value / pageWidthValue);
  }, [scrollXOffset, pageWidth]);

  const scrollToPageIndex = React.useCallback(
    (index: number, velocity?: number) => {
      const pageWidthValue =
        typeof pageWidth === "number" ? pageWidth : pageWidth.value;
      const newOffset = index * pageWidthValue;

      const duration = velocity
        ? Math.abs((newOffset - scrollXOffset.value) / velocity) * 1000
        : 300; // Default duration if no velocity is provided

      scrollXOffset.value = withTiming(
        clamp(newOffset, 0, (pageCount - 1) * pageWidthValue),
        {
          duration: Math.min(duration, 300), // Ensure a maximum duration
        }
      );
    },
    []
  );

  const pageIndexRef = React.useRef<number>(0);

  const updatePageIndex = React.useCallback(() => {
    pageIndexRef.current = getPageIndex();
  }, [getPageIndex]);

  const onEndScroll = React.useCallback(
    (velocityX: number, translationX: number) => {
      const pageWidthValue =
        typeof pageWidth === "number" ? pageWidth : pageWidth.value;

      const movementPercentage = Math.abs(translationX) / pageWidthValue;

      const hasMovedEnough = movementPercentage > underScrollPercentage;
      const isFastEnough = Math.abs(velocityX) > fastEnoughVelocity; // Arbitrary threshold for "fast enough"

      if (!hasMovedEnough && !isFastEnough) {
        // If the gesture didn't move enough, snap back to the current page
        scrollToPageIndex(pageIndexRef.current);

        return;
      }

      const direction: "left" | "right" = translationX < 0 ? "left" : "right";

      if (direction === "left") {
        if (pageIndexRef.current >= pageCount - 1) {
          // Snap back to the last page if we're on the last page
          scrollToPageIndex(pageIndexRef.current);
          return;
        }

        // If the gesture was to the left, go to the next page
        const nextPageIndex = pageIndexRef.current + 1;

        scrollToPageIndex(nextPageIndex, velocityX);
      } else {
        if (pageIndexRef.current === 0) {
          // Snap back to the first page if we're on the first page
          scrollToPageIndex(pageIndexRef.current);
          return;
        }

        // If the gesture was to the right, go to the previous page
        const previousPageIndex = pageIndexRef.current - 1;

        scrollToPageIndex(previousPageIndex, velocityX);
      }
    },
    [scrollToPageIndex, pageWidth, pageCount]
  );

  const gesture = React.useMemo(() => {
    return Gesture.Pan()
      .onStart(() => {
        runOnJS(updatePageIndex)();
      })
      .onChange((event) => {
        if (enableScrollSharedValue.value === false) return;

        const pw = typeof pageWidth === "number" ? pageWidth : pageWidth.value;
        const min = 0;
        const max = (pageCount - 1) * pw;
        const nextOffset = scrollXOffset.value - event.changeX;

        if (nextOffset < min) {
          // Overscrolling to the left
          const overscroll = Math.abs(nextOffset - min);
          const maxOverscroll = pw * underScrollPercentage;
          const resistance = 1 - Math.min(overscroll / maxOverscroll, 1); // 1 → 0
          scrollXOffset.value -= event.changeX * resistance;
        } else if (nextOffset > max) {
          // Overscrolling to the right
          const overscroll = Math.abs(nextOffset - max);
          const maxOverscroll = pw * underScrollPercentage;
          const resistance = 1 - Math.min(overscroll / maxOverscroll, 1); // 1 → 0
          scrollXOffset.value -= event.changeX * resistance;
        } else {
          // Normal scrolling
          scrollXOffset.value = nextOffset;
        }
      })
      .onEnd((event) => {
        if (enableScrollSharedValue.value === false) return;

        runOnJS(onEndScroll)(event.velocityX, event.translationX);
      });
  }, [
    updatePageIndex,
    onEndScroll,
    scrollXOffset,
    pageWidth,
    pageCount,
    enableScrollSharedValue,
  ]);

  return (
    <GestureDetector gesture={gesture}>
      <AnimatedView
        style={style}
        overflow="hidden"
        flexDirection="row"
        justify="center"
        items={Platform.select({ web: "flex-start", default: "center" })}
        {...props}
      >
        <View flexDirection="row">
          <AnimatedView style={leftSpacerStyle} height="100%" />
          {children}
          <AnimatedView style={rightSpacerStyle} height="100%" />
        </View>
      </AnimatedView>
    </GestureDetector>
  );
});

export interface PageProps extends ViewProps {
  pageWidth: number | SharedValue<number>;
}

export const Page = React.memo(function Page(props: PageProps) {
  const { pageWidth, ...rest } = props;

  const style = useAnimatedStyle(() => {
    const width = typeof pageWidth === "number" ? pageWidth : pageWidth.value;
    return {
      width,
      minWidth: width,
      maxWidth: width,
    };
  });

  return <AnimatedView height="100%" flex={1} {...rest} style={style} />;
});

export interface UsePaginationControlsProps {
  scrollXOffset: SharedValue<number>;
  scrollXControl: SharedValue<number>;
  pageWidth: number | SharedValue<number>;
  pageCount: number;
  scrollDuration?: number;
  enableScrollSharedValue: SharedValue<boolean>;
}

export function usePaginationControls({
  pageCount,
  pageWidth: pageWidthProp,
  scrollXOffset,
  scrollDuration = 300,
  scrollXControl,
  enableScrollSharedValue,
}: UsePaginationControlsProps) {
  const getPageWidth = React.useCallback(() => {
    return typeof pageWidthProp === "number"
      ? pageWidthProp
      : pageWidthProp.value;
  }, [pageWidthProp]);

  const previous = React.useCallback(() => {
    if (!enableScrollSharedValue.value) return;

    const pageWidth = getPageWidth();

    const currentIndex = Math.round(scrollXOffset.value / pageWidth);
    const nextIndex = currentIndex === 0 ? pageCount - 1 : currentIndex - 1;

    scrollXControl.value = withTiming(nextIndex * pageWidth, {
      duration: scrollDuration,
    });
  }, [
    getPageWidth,
    scrollXOffset,
    pageCount,
    scrollDuration,
    scrollXControl,
    enableScrollSharedValue,
  ]);

  const next = React.useCallback(() => {
    if (!enableScrollSharedValue.value) return;

    const pageWidth = getPageWidth();

    const currentIndex = Math.round(scrollXOffset.value / pageWidth);
    const nextIndex = currentIndex >= pageCount - 1 ? 0 : currentIndex + 1;

    scrollXControl.value = withTiming(nextIndex * pageWidth, {
      duration: scrollDuration,
    });
  }, [
    getPageWidth,
    scrollXOffset,
    pageCount,
    scrollDuration,
    scrollXControl,
    enableScrollSharedValue,
  ]);

  return { previous, next };
}
