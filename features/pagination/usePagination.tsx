import React from "react";
import Animated, {
  AnimatedRef,
  runOnJS,
  scrollTo,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useScrollViewOffset,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ScrollViewProps, ViewProps as RNViewProps } from "react-native";
import { View, ViewProps } from "tamagui";

const AnimatedView = Animated.createAnimatedComponent(View);

export interface PaginationProps {
  pageWidth: number;
  scrollDuration?: number;
  pageCount: number;
  enableScrollSharedValue: SharedValue<boolean>;
}

type InjectedProps = ScrollViewProps & {
  ref: AnimatedRef<Animated.ScrollView>;
};

function withScrollView(injectedProps: InjectedProps) {
  return React.memo<ScrollViewProps>(function ScrollView(props) {
    return <Animated.ScrollView {...injectedProps} {...props} />;
  });
}

function withControlledScrollView({
  pageWidth,
  scrollXOffset,
  pageCount,
}: {
  pageWidth: number;
  scrollXOffset: SharedValue<number>;
  pageCount: number;
}) {
  /**
   * We can't use <AnimatedView style={animatedLeftPosition} position="absolute">{children}</AnimatedView>
   * here as it prevents nested scroll views from working. This appears to be a Animated.View
   * issue. So instead we use animated spacers to the left and right and "center" positioning to
   * achieve the same effect.
   */
  return React.memo(function ControlledScrollView({
    children,
    ...props
  }: RNViewProps) {
    const leftSpacerStyle = useAnimatedStyle(() => {
      const remainingWidth = (pageCount - 1) * pageWidth - scrollXOffset.value;
      return {
        width: remainingWidth,
      };
    });

    const rightSpacerStyle = useAnimatedStyle(() => {
      return {
        width: scrollXOffset.value,
      };
    });

    return (
      <View
        width={pageWidth}
        minW={pageWidth}
        maxW={pageWidth}
        overflow="hidden"
        flexDirection="row"
        justify="center"
        items="center"
        {...props}
      >
        <View flexDirection="row">
          <AnimatedView style={leftSpacerStyle} height="100%" />
          {children}
          <AnimatedView style={rightSpacerStyle} height="100%" />
        </View>
      </View>
    );
  });
}

function withPage(pageWidth: number) {
  return React.memo(function Page(props: ViewProps) {
    return (
      <View
        width={pageWidth}
        minW={pageWidth}
        maxW={pageWidth}
        height="100%"
        flex={1}
        {...props}
      />
    );
  });
}

function useControls({
  pageCount,
  pageWidth,
  scrollXOffset,
  scrollDuration,
  scrollXControl,
  enableScrollSharedValue,
}: {
  scrollXOffset: SharedValue<number>;
  scrollXControl: SharedValue<number>;
  pageWidth: number;
  pageCount: number;
  scrollDuration: number;
  enableScrollSharedValue: SharedValue<boolean>;
}) {
  const previous = React.useCallback(() => {
    if (!enableScrollSharedValue.value) return;

    const currentIndex = Math.round(scrollXOffset.value / pageWidth);
    const nextIndex = currentIndex === 0 ? pageCount - 1 : currentIndex - 1;

    scrollXControl.value = withTiming(nextIndex * pageWidth, {
      duration: scrollDuration,
    });
  }, [
    pageWidth,
    scrollXOffset,
    pageCount,
    scrollDuration,
    scrollXControl,
    enableScrollSharedValue,
  ]);

  const next = React.useCallback(() => {
    if (!enableScrollSharedValue.value) return;

    const currentIndex = Math.round(scrollXOffset.value / pageWidth);
    const nextIndex = currentIndex >= pageCount - 1 ? 0 : currentIndex + 1;

    scrollXControl.value = withTiming(nextIndex * pageWidth, {
      duration: scrollDuration,
    });
  }, [
    pageWidth,
    scrollXOffset,
    pageCount,
    scrollDuration,
    scrollXControl,
    enableScrollSharedValue,
  ]);

  return { previous, next };
}

export function useControlledPagination({
  pageWidth,
  scrollDuration = 300,
  pageCount,
  enableScrollSharedValue,
}: PaginationProps) {
  const scrollXOffset = useSharedValue(0); // only use internally

  const controls = useControls({
    pageCount,
    pageWidth,
    scrollXOffset,
    scrollXControl: scrollXOffset,
    scrollDuration,
    enableScrollSharedValue,
  });

  const { Page, ControlledScrollView } = React.useMemo(() => {
    return {
      Page: withPage(pageWidth),
      ControlledScrollView: withControlledScrollView({
        pageWidth,
        scrollXOffset: scrollXOffset,
        pageCount,
      }),
    };
  }, [pageWidth, scrollXOffset, pageCount]);

  return {
    ...controls,
    scrollXOffset,
    Page,
    ControlledScrollView,
  };
}

export function useScrollablePagination({
  pageWidth,
  scrollDuration = 300,
  pageCount,
  enableScrollSharedValue,
}: PaginationProps) {
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollXControl = useSharedValue(0); // only use internally
  const scrollXOffset = useScrollViewOffset(scrollViewRef);
  const [scrollEnabled, setScrollEnabled] = React.useState(
    () => enableScrollSharedValue.value
  );

  useDerivedValue(() => {
    scrollTo(scrollViewRef, scrollXControl.value, 0, true);
  });

  useDerivedValue(() => {
    runOnJS(setScrollEnabled)(enableScrollSharedValue.value);
  });

  const controls = useControls({
    pageCount,
    pageWidth,
    scrollXOffset,
    scrollXControl: scrollXControl,
    scrollDuration,
    enableScrollSharedValue,
  });

  const { ScrollView, scrollViewProps, Page } = React.useMemo(() => {
    const scrollViewProps: InjectedProps = {
      horizontal: true,
      snapToInterval: pageWidth,
      pagingEnabled: true,
      decelerationRate: "fast",
      snapToAlignment: "start",
      showsHorizontalScrollIndicator: false,
      disableIntervalMomentum: true,
      ref: scrollViewRef,
    };

    return {
      Page: withPage(pageWidth),
      ScrollView: withScrollView(scrollViewProps),
      scrollViewProps,
    };
  }, [pageWidth, scrollViewRef]);

  return {
    ...controls,
    scrollXOffset,
    scrollViewProps,
    ScrollView,
    Page,
  };
}
