import React from "react";
import { Dimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { ScrollView, ScrollViewProps } from "tamagui";
import ClockTimer from "./ClockTimer";
import DurationTimer from "./DurationTimer";
import Timer from "./Timer";

export interface TimersScrollViewProps extends ScrollViewProps {}

const intervalDebounce = 100; // 100ms debounce, tweak to taste

export default React.memo(function TimersScrollView({
  ...props
}: TimersScrollViewProps): React.ReactNode {
  const [intervalWidth, setIntervalWidth] = React.useState<number>(
    Dimensions.get("window").width
  );

  const height = useSharedValue<number>(Dimensions.get("window").height);
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

  return (
    <ScrollView
      onLayout={onLayout}
      flex={1}
      horizontal
      snapToInterval={intervalWidth}
      pagingEnabled
      decelerationRate="fast"
      snapToAlignment="start"
      showsHorizontalScrollIndicator={false}
      {...props}
    >
      <ClockTimer height={height} width={width} />
      <DurationTimer height={height} width={width} />
      <Timer height={height} width={width} />
    </ScrollView>
  );
});
