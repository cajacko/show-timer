import React from "react";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Circle, CircleProps } from "tamagui";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CustomIndicatorProps {
  scrollX: SharedValue<number>;
  pageWidth: number | SharedValue<number>;
  pageIndex: number;
  size?: number;
  outOfViewScale?: number;
}

export type IndicatorProps = CircleProps & CustomIndicatorProps;

const defaultIndicatorSize = 15;
const defaultOutOfViewIndicatorScale = 0.5; // Scale for indicators that 100%

export default React.memo(function Indicator({
  scrollX,
  pageWidth: pageWidthProp,
  pageIndex,
  size = defaultIndicatorSize,
  outOfViewScale = defaultOutOfViewIndicatorScale,
  ...props
}: IndicatorProps): React.ReactNode {
  const style = useAnimatedStyle(() => {
    const pageWidth =
      typeof pageWidthProp === "number" ? pageWidthProp : pageWidthProp.value;
    const center = pageIndex * pageWidth;

    const scale = interpolate(
      scrollX.value,
      [center - pageWidth, center, center + pageWidth],
      [outOfViewScale, 1, outOfViewScale],
      Extrapolation.CLAMP
    );

    return {
      backgroundColor: "white",
      width: size * scale,
      opacity: scale,
      transform: [
        {
          scale,
        },
      ],
    };
  });

  return <AnimatedCircle size={size} style={style} {...props} />;
});
