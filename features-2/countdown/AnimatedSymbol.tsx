import React from "react";
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Text, View } from "tamagui";

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedView = Animated.createAnimatedComponent(View);

type Symbol = "-" | ":";

const symbolSpacing: Record<Symbol, { width: number; marginTop: number }> = {
  "-": { width: 0.5, marginTop: 0.1 },
  ":": { width: 0.2, marginTop: 0.2 },
};

export interface AnimatedSymbolProps {
  color: SharedValue<string>;
  fontSize: SharedValue<number>;
  visible: SharedValue<boolean>;
  symbol: Symbol;
}

export default React.memo(function AnimatedSymbol({
  color,
  fontSize,
  visible,
  symbol,
}: AnimatedSymbolProps): React.ReactNode {
  const style = useAnimatedStyle(() => ({
    height: fontSize.value,
  }));

  const { width, marginTop } = symbolSpacing[symbol];

  const textStyle = useAnimatedStyle(() => ({
    color: color.value,
    fontSize: fontSize.value,
    opacity: visible.value ? 1 : 0,
    width: visible.value ? fontSize.value * width : 0,
    marginTop: -fontSize.value * marginTop,
  }));

  return (
    <AnimatedView style={style}>
      <AnimatedText style={textStyle}>{symbol}</AnimatedText>
    </AnimatedView>
  );
});
