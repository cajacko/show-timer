import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { Text, View } from "tamagui";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

const zeroToNine = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default React.memo(function Digit({
  value: sharedValue,
  reversedDigitIndex,
  fontSize,
  rounded = false,
  color,
  leadingZeroes,
}: {
  value: SharedValue<number | null>;
  color?: SharedValue<string>;
  /**
   * Is this the last number, the 10's digits the 100's? Done as an index. So:
   * 0 = 1's
   * 1 = 10's
   * 2 = 100's
   * ...
   */
  reversedDigitIndex: number;
  fontSize: SharedValue<number>;
  rounded?: boolean;
  leadingZeroes?: SharedValue<boolean>;
}) {
  /**
   * Returns the floored value of the countdown for this digit.
   */
  const zeroToNineIndex = useDerivedValue((): number | null => {
    if (sharedValue.value === null) {
      return null;
    }

    let value = sharedValue.value;

    if (rounded) {
      value = Math.round(value);
    }

    const countdownString = value.toString().split(".")[0].split("");

    const digitString =
      countdownString[countdownString.length - 1 - reversedDigitIndex];

    const digit = parseInt(digitString, 10);

    if (isNaN(digit) || digit === undefined) {
      return leadingZeroes?.value === true ? 0 : null;
    }

    if (digit !== 0) return digit;
    if (reversedDigitIndex === 0) return 0;
    if (leadingZeroes?.value === true) return 0;

    let isLeadingZero = true;

    for (let i = reversedDigitIndex + 1; i < countdownString.length; i++) {
      const nextDigit = parseInt(
        countdownString[countdownString.length - 1 - i],
        10
      );

      if (nextDigit !== 0) {
        isLeadingZero = false;
        break;
      }
    }

    if (isLeadingZero) return null;

    return digit;
  });

  /**
   * Displays the correct digit for the countdown
   */
  const animatedStyle = useAnimatedStyle(() => {
    let opacity = 1;
    let marginTop = 0;
    let width: number | undefined;

    const horizontalOffset =
      zeroToNineIndex.value === 1 ? fontSize.value * 0.1 : 0;

    if (zeroToNineIndex.value === null) {
      opacity = 0;
      width = 0;
    } else {
      const numberWidth = 0.6;

      width = fontSize.value * numberWidth - horizontalOffset;
      marginTop = -fontSize.value * zeroToNineIndex.value;
    }

    return {
      marginLeft: horizontalOffset,
      marginTop,
      opacity,
      width,
      height: fontSize.value * zeroToNine.length,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: color?.value ?? "#000",
    fontSize: fontSize.value,
    lineHeight: fontSize.value,
  }));

  const wrapperStyle = useAnimatedStyle(() => ({
    height: fontSize.value,
  }));

  return (
    <AnimatedView style={animatedStyle} flexDirection="column">
      {zeroToNine.map((number, i) => (
        <AnimatedView key={i} style={wrapperStyle}>
          <AnimatedText style={animatedTextStyle}>{number}</AnimatedText>
        </AnimatedView>
      ))}
    </AnimatedView>
  );
});
