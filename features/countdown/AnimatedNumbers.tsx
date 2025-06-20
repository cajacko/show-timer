import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { View } from "tamagui";
import AnimatedNumber from "./AnimatedNumber";

const AnimatedView = Animated.createAnimatedComponent(View);

export interface AnimatedNumbersProps {
  value: SharedValue<number | null>;
  fontSize: SharedValue<number>;
  color: SharedValue<string>;
  maxDigits: number;
  leadingZeroes?: SharedValue<boolean>;
}

export default React.memo(function AnimatedNumbers({
  value,
  fontSize,
  color,
  maxDigits,
  leadingZeroes,
}: AnimatedNumbersProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: fontSize.value,
  }));

  const digitArray = React.useMemo(
    () => new Array(maxDigits).fill(0),
    [maxDigits]
  );

  return (
    <AnimatedView style={animatedStyle} flexDirection="row" overflow="hidden">
      {digitArray.map((_, i) => {
        const reversedDigitIndex = digitArray.length - 1 - i;

        return (
          <AnimatedNumber
            key={i}
            value={value}
            fontSize={fontSize}
            reversedDigitIndex={reversedDigitIndex}
            color={color}
            leadingZeroes={leadingZeroes}
          />
        );
      })}
    </AnimatedView>
  );
});
