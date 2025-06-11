import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Circle, View, ViewProps } from "tamagui";
import { Durations } from "../duration-picker/types";
import StageButton from "./StageButton";

const AnimatedView = Animated.createAnimatedComponent(View);

export interface StageSelectorProps extends ViewProps {
  green: Durations;
  yellow: Durations;
  red: Durations;
  activePosition?: "top" | "bottom";
  active: "green" | "yellow" | "red";
  onChange: (stage: "green" | "yellow" | "red") => void;
}

function durationToString(duration: number): string {
  if (duration === 0) return "0";

  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

const spacing = "$space.1";

export default React.memo(function StageSelector({
  active,
  green,
  onChange,
  red,
  yellow,
  activePosition = "bottom",
  ...props
}: StageSelectorProps): React.ReactNode {
  const actions = React.useMemo(
    () => ({
      green: () => onChange("green"),
      yellow: () => onChange("yellow"),
      red: () => onChange("red"),
    }),
    [onChange]
  );

  /**
   * 0 represents the green stage, 1 represents the yellow stage, and 2 represents the red stage.
   */
  const activeIndicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    let newValue: number;

    switch (active) {
      case "green":
        newValue = 0;
        break;
      case "yellow":
        newValue = 1;
        break;
      case "red":
        newValue = 2;
        break;
      default:
        newValue = 0; // Default to green if active is not recognized
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
      {activePosition === "top" && activeChildren}
      <View flexDirection="row">
        <View flex={1} px={spacing}>
          <StageButton
            durations={green}
            color="green"
            onPress={actions.green}
            width="100%"
          />
        </View>
        <View flex={1} px={spacing}>
          <StageButton
            durations={yellow}
            color="yellow"
            onPress={actions.yellow}
            width="100%"
          />
        </View>
        <View flex={1} px={spacing}>
          <StageButton
            durations={red}
            color="red"
            onPress={actions.red}
            width="100%"
          />
        </View>
      </View>
      {activePosition === "bottom" && activeChildren}
    </View>
  );
});
