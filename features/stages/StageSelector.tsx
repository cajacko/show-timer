import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Circle, View, ViewProps } from "tamagui";
import StageButton from "./StageButton";
import { Stage } from "./Stage.types";
import stageColors from "./stageColors";

export type { Stage };

const AnimatedView = Animated.createAnimatedComponent(View);

export interface StageSelectorProps extends ViewProps {
  okayValue?: string;
  warningValue?: string;
  alertValue?: string;
  activePosition?: "top" | "bottom";
  active?: Stage;
  onChange?: (stage: Stage) => void;
}

const spacing = "$space.1";

export default React.memo(function StageSelector({
  active,
  onChange,
  activePosition = "bottom",
  okayValue,
  warningValue,
  alertValue,
  ...props
}: StageSelectorProps): React.ReactNode {
  const stages = React.useMemo(() => {
    const result: { key: Stage; value: string }[] = [];
    if (okayValue !== undefined) result.push({ key: "okay", value: okayValue });
    if (warningValue !== undefined)
      result.push({ key: "warning", value: warningValue });
    if (alertValue !== undefined)
      result.push({ key: "alert", value: alertValue });
    return result;
  }, [okayValue, warningValue, alertValue]);

  const actions = React.useMemo(
    () => ({
      okay: () => onChange?.("okay"),
      warning: () => onChange?.("warning"),
      alert: () => onChange?.("alert"),
    }),
    [onChange]
  );

  /**
   * 0 represents the okay stage, 1 represents the warning stage, and 2 represents the alert stage.
   */
  const activeIndicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    const index = stages.findIndex((stage) => stage.key === active);
    if (index === -1) return;

    activeIndicatorPosition.value = withSpring(index, {
      damping: 10,
      stiffness: 100,
      mass: 0.7,
    });
  }, [active, activeIndicatorPosition, stages]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: `${activeIndicatorPosition.value * 100}%`,
        },
      ],
    };
  });

  const activeChildren = (
    <View width="100%" justify="center" items="center">
      <View width={`${stages.length * 33.33}%`} position="relative">
        <AnimatedView
          width={`${100 / stages.length}%`}
          items="center"
          justify="center"
          mt={activePosition === "bottom" ? spacing : 0}
          mb={activePosition === "top" ? spacing : 0}
          style={animatedStyle}
        >
          <Circle
            background="white"
            style={{ backgroundColor: "white" }}
            height="$0.75"
            width="$0.75"
          />
        </AnimatedView>
      </View>
    </View>
  );

  return (
    <View width="100%" {...props}>
      {activePosition === "top" && !!active && activeChildren}
      <View flexDirection="row" justify="center">
        {stages.map(({ key, value }) => (
          <View key={key} width="33.33%" px={spacing}>
            <StageButton
              value={value}
              borderColor={stageColors[key]}
              onPress={actions[key]}
              width="100%"
            />
          </View>
        ))}
      </View>
      {activePosition === "bottom" && !!active && activeChildren}
    </View>
  );
});
