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
  const stageCount = React.useMemo(() => {
    let count = 0;
    if (okayValue !== undefined) count++;
    if (warningValue !== undefined) count++;
    if (alertValue !== undefined) count++;
    return count;
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
    let newValue: number;

    switch (active) {
      case "okay":
        newValue = 0;
        break;
      case "warning":
        newValue = 1;
        break;
      case "alert":
        newValue = 2;
        break;
      default:
        return;
    }

    activeIndicatorPosition.value = withSpring(newValue);
  }, [active, activeIndicatorPosition]);

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
    <AnimatedView
      width="33.33%"
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
  );

  return (
    <View width="100%" {...props}>
      {activePosition === "top" && !!active && activeChildren}
      <View flexDirection="row">
        {okayValue !== undefined && (
          <View flex={1} px={spacing}>
            <StageButton
              value={okayValue}
              borderColor={stageColors.okay}
              onPress={actions.okay}
              width="100%"
            />
          </View>
        )}
        {warningValue !== undefined && (
          <View flex={1} px={spacing}>
            <StageButton
              value={warningValue}
              borderColor={stageColors.warning}
              onPress={actions.warning}
              width="100%"
            />
          </View>
        )}
        {alertValue !== undefined && (
          <View flex={1} px={spacing}>
            <StageButton
              value={alertValue}
              borderColor={stageColors.alert}
              onPress={actions.alert}
              width="100%"
            />
          </View>
        )}
      </View>
      {activePosition === "bottom" && !!active && activeChildren}
    </View>
  );
});
