import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import AnimatedNumber from "./AnimatedNumber";

// TODO: Have it auto expand to fit the digits, but still require a expectedMaxDigits prop, then we
// only cause a react render in unexpected edge cases but still satisfy the user. And this would
// only be with huge numbers so it shouldn't update often as it would be the highest decimal

export interface AnimatedNumbersProps {
  value: SharedValue<number>;
  fontSize: SharedValue<number>;
  color: SharedValue<string>;
  style?: StyleProp<ViewStyle>;
  maxDigits: number;
}

export default React.memo(function AnimatedNumbers({
  value,
  fontSize,
  color,
  style: styleProp,
  maxDigits,
}: AnimatedNumbersProps): React.ReactNode {
  const animatedStyle = useAnimatedStyle(() => ({
    height: fontSize.value,
  }));

  const style = React.useMemo(
    () => [styles.container, animatedStyle, styleProp],
    [styleProp, animatedStyle]
  );

  const digitArray = React.useMemo(
    () => new Array(maxDigits).fill(0),
    [maxDigits]
  );

  return (
    <Animated.View style={style}>
      {digitArray.map((_, i) => {
        const reversedDigitIndex = digitArray.length - 1 - i;

        return (
          <AnimatedNumber
            key={i}
            value={value}
            fontSize={fontSize}
            reversedDigitIndex={reversedDigitIndex}
            color={color}
          />
        );
      })}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    flexDirection: "row",
  },
});
