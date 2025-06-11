import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Text, View } from "tamagui";

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);

export interface AnimatedColonProps {
  color: SharedValue<string>;
  fontSize: SharedValue<number>;
  visible: SharedValue<boolean>;
}

export default React.memo(function AnimatedColon({
  color,
  fontSize,
  visible,
}: AnimatedColonProps): React.ReactNode {
  const style = useAnimatedStyle(() => ({
    height: fontSize.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: color.value,
    fontSize: fontSize.value,
    opacity: visible.value ? 1 : 0,
    width: visible.value ? fontSize.value * 0.2 : 0,
    marginTop: -fontSize.value * 0.2, // Adjust to center the colon vertically
  }));

  return (
    <AnimatedView style={style}>
      <AnimatedText style={textStyle}>:</AnimatedText>
    </AnimatedView>
  );
});
