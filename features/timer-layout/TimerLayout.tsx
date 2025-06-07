import React from "react";
import { ViewProps as RNViewProps } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { View, ViewProps } from "tamagui";

type AnimatedSize = {
  width: SharedValue<number>;
  height: SharedValue<number>;
};

export type TimerLayoutChild =
  | ((size: AnimatedSize) => React.ReactNode)
  | React.ReactNode;

export interface TimerLayoutProps extends ViewProps {
  /**
   * 0 is hidden, 1 is fully visible
   */
  bottomVisibility: SharedValue<number>;
  children: [TimerLayoutChild, TimerLayoutChild];
}

const split = 0.75; // When the bottom is fully visible, this is how much of the screen it should take up

/**
 * In portrait we lay out as top and bottom, in landscape we lay out as left and right.
 */
export default React.memo(function TimerLayout({
  bottomVisibility,
  children,
  ...viewProps
}: TimerLayoutProps): React.ReactNode {
  const [top, bottom] = children;
  const [hasSetSize, setHasSetSize] = React.useState(false);

  const height = useSharedValue<number>(100);
  const width = useSharedValue<number>(100);

  const isPortrait = useDerivedValue<boolean>(() => {
    return height.value >= width.value;
  });

  const topHeight = useDerivedValue(() => {
    if (!isPortrait.value) return height.value;

    return height.value * (1 - bottomVisibility.value * split);
  });

  const bottomHeight = useDerivedValue(() => {
    if (!isPortrait.value) return height.value;

    return height.value * (bottomVisibility.value * split);
  });

  const topWidth = useDerivedValue(() => {
    if (!isPortrait.value) {
      return width.value * (1 - bottomVisibility.value * split);
    }

    return width.value;
  });

  const bottomWidth = useDerivedValue(() => {
    if (!isPortrait.value) {
      return width.value * (bottomVisibility.value * split);
    }

    return width.value;
  });

  const onLayout = React.useCallback<NonNullable<RNViewProps["onLayout"]>>(
    (event) => {
      const { width: newWidth, height: newHeight } = event.nativeEvent.layout;

      height.value = newHeight;
      width.value = newWidth;

      setHasSetSize(true);
    },
    [height, width]
  );

  const topChildren = React.useMemo(() => {
    if (typeof top === "function") {
      return top({
        width: topWidth,
        height: topHeight,
      });
    }
    return top;
  }, [top, topWidth, topHeight]);

  const bottomChildren = React.useMemo(() => {
    if (typeof bottom === "function") {
      return bottom({
        width: bottomWidth,
        height: bottomHeight,
      });
    }
    return bottom;
  }, [bottom, bottomWidth, bottomHeight]);

  const topStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      width: topWidth.value,
      height: topHeight.value,
    };
  });

  const bottomStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: bottomWidth.value,
      height: bottomHeight.value,
      overflow: "hidden",
    };
  });

  return (
    <View {...viewProps} onLayout={onLayout} id="test">
      {hasSetSize && (
        <Animated.View style={topStyle}>{topChildren}</Animated.View>
      )}
      {hasSetSize && (
        <Animated.View style={bottomStyle}>{bottomChildren}</Animated.View>
      )}
    </View>
  );
});
