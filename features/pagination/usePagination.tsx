import React from "react";
import Animated, {
  AnimatedRef,
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ScrollViewProps } from "react-native";
import { View, ViewProps } from "tamagui";

export interface PaginationProps {
  pageWidth: number;
  scrollDuration?: number;
  pageCount: number;
}

type InjectedProps = ScrollViewProps & {
  ref: AnimatedRef<Animated.ScrollView>;
};

function withScrollView(injectedProps: InjectedProps) {
  return React.memo(function ScrollView(props: ScrollViewProps) {
    return <Animated.ScrollView {...injectedProps} {...props} />;
  });
}

function withPage(pageWidth: number) {
  return React.memo(function Page(props: ViewProps) {
    return <View width={pageWidth} height="100%" flex={1} {...props} />;
  });
}

export default function usePagination({
  pageWidth,
  scrollDuration = 300,
  pageCount,
}: PaginationProps) {
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const _scrollX = useSharedValue(0); // only use internally
  const scrollXOffset = useScrollViewOffset(scrollViewRef);

  useDerivedValue(() => {
    scrollTo(scrollViewRef, _scrollX.value, 0, true);
  });

  const previous = React.useCallback(() => {
    const currentIndex = Math.round(scrollXOffset.value / pageWidth);
    const nextIndex = currentIndex === 0 ? pageCount : currentIndex - 1;

    _scrollX.value = withTiming(nextIndex * pageWidth, {
      duration: scrollDuration,
    });
  }, [pageWidth, _scrollX, scrollXOffset, pageCount, scrollDuration]);

  const next = React.useCallback(() => {
    const currentIndex = Math.round(scrollXOffset.value / pageWidth);
    const nextIndex = currentIndex === pageCount ? 0 : currentIndex + 1;

    _scrollX.value = withTiming(nextIndex * pageWidth, {
      duration: scrollDuration,
    });
  }, [pageWidth, _scrollX, scrollXOffset, pageCount, scrollDuration]);

  const { ScrollView, scrollViewProps, Page } = React.useMemo(() => {
    const scrollViewProps: InjectedProps = {
      horizontal: true,
      snapToInterval: pageWidth,
      pagingEnabled: true,
      decelerationRate: "fast",
      snapToAlignment: "start",
      showsHorizontalScrollIndicator: false,
      ref: scrollViewRef,
      disableIntervalMomentum: true,
    };

    return {
      Page: withPage(pageWidth),
      ScrollView: withScrollView(scrollViewProps),
      scrollViewProps,
    };
  }, [pageWidth, scrollViewRef]);

  return {
    scrollViewRef,
    scrollXOffset,
    previous,
    next,
    scrollViewProps,
    ScrollView,
    Page,
  };
}
