import { Stage } from "@/features/stages/Stage.types";
import React from "react";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button, useTheme, View, ViewProps } from "tamagui";
import Countdown from "@/features/countdown/Countdown";
import stageColors from "@/features/stages/stageColors";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { ChevronLeft, LockKeyhole, UnlockKeyhole } from "@tamagui/lucide-icons";
import { Orientation, useOrientation } from "@/hooks/useOrientation";
import { Platform } from "react-native";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedButton = Animated.createAnimatedComponent(Button);

export interface DisplayProps extends Omit<ViewProps, "height" | "width"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  back: () => void;
  colorVariant?: "border" | "background";
  showText?: boolean;
  stage: Stage;
  onPress?: () => { handled: boolean };
  duration: SharedValue<number | null>;
  fullScreenAmount: SharedValue<number>;
  // pause?: () => void;
  // resume?: () => void;
  // reset?: () => void;
}

const actionsDuration = 300;
const showActionsDuration = 3000;

export default React.memo(function Display({
  height,
  width,
  back: backProp,
  colorVariant,
  showText,
  stage,
  onPress,
  duration: durationProp,
  fullScreenAmount,
  ...props
}: DisplayProps): React.ReactNode {
  const _actionsVisibility = useSharedValue<number>(0);
  const _lockVisibility = useSharedValue<number>(0);
  const _orientation = useOrientation();

  const hideActionsTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const hideLockTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  React.useEffect(() => {
    _lockVisibility.value = withTiming(1, {
      duration: actionsDuration,
    });

    hideLockTimeout.current = setTimeout(() => {
      _lockVisibility.value = withTiming(0, {
        duration: actionsDuration,
      });
    }, showActionsDuration);
  }, [_orientation, _lockVisibility]);

  const actionsVisibility = useDerivedValue(() => {
    if (_actionsVisibility.value === 0) return 0;
    if (fullScreenAmount.value !== 1) return fullScreenAmount.value;

    return _actionsVisibility.value;
  });

  const lockVisibility = useDerivedValue(() => {
    if (fullScreenAmount.value !== 1) return fullScreenAmount.value;
    if (actionsVisibility.value === 0) return _lockVisibility.value;

    return actionsVisibility.value;
  });

  const showActions = React.useCallback(() => {
    if (hideActionsTimeout.current) {
      clearTimeout(hideActionsTimeout.current);
    }

    _actionsVisibility.value = withTiming(1, {
      duration: actionsDuration,
    });

    hideActionsTimeout.current = setTimeout(() => {
      _actionsVisibility.value = withTiming(0, {
        duration: actionsDuration,
      });
    }, showActionsDuration);
  }, [_actionsVisibility]);

  const [lockedOrientation, setLockedOrientation] =
    React.useState<null | Orientation>(null);

  const lockOrientation = React.useCallback(() => {
    setLockedOrientation((prevValue) => (prevValue ? null : _orientation));
  }, [_orientation]);

  const orientation = useDerivedValue(() => {
    if (fullScreenAmount.value !== 1) {
      return "portrait-up";
    }

    return lockedOrientation ?? _orientation;
  });

  const rotation = useDerivedValue(() => {
    switch (orientation.value) {
      case "portrait-down":
        return 180;
      case "landscape-left":
        return -90;
      case "landscape-right":
        return 90;
      case "portrait-up":
      default:
        return 0;
    }
  });

  const duration = useDerivedValue<number | null>(
    () => (durationProp.value === null ? 0 : durationProp.value),
    [durationProp]
  );

  const theme = useTheme();
  const backgroundColor = theme[stageColors[stage]]?.val;

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
    padding: colorVariant === "border" ? Math.round(width.value * 0.03) : 0,
    backgroundColor,
  }));

  const fontSize = useDerivedValue(() => {
    if (
      orientation.value === "landscape-left" ||
      orientation.value === "landscape-right"
    ) {
      return Math.round(width.value * 0.5);
    }

    return Math.round(width.value * 0.2);
  });

  const textColor = useDerivedValue(() => {
    return "white";
  });

  const onTap = React.useCallback(() => {
    const { handled } = onPress?.() || {};

    if (handled) {
      return;
    }

    if (_actionsVisibility.value === 1) {
      _actionsVisibility.value = withTiming(0, {
        duration: actionsDuration,
      });
    } else {
      showActions();
    }
  }, [onPress, _actionsVisibility, showActions]);

  const gesture = React.useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        runOnJS(onTap)();
      }),
    [onTap]
  );

  const backStyle = useAnimatedStyle(() => {
    const position: {
      top: number | "auto";
      bottom: number | "auto";
      left: number | "auto";
      right: number | "auto";
    } = {
      top: "auto",
      bottom: "auto",
      left: "auto",
      right: "auto",
    };

    switch (orientation.value) {
      case "portrait-down":
        position.bottom = 0;
        position.right = 0;
        break;
      case "landscape-left":
        position.bottom = 0;
        position.left = 0;
        break;
      case "landscape-right":
        position.top = 0;
        position.right = 0;
        break;
      case "portrait-up":
      default:
        position.top = 0;
        position.left = 0;
        break;
    }

    return {
      ...position,
      opacity: actionsVisibility.value,
      transform: [
        {
          scale: actionsVisibility.value,
        },
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  const lockStyle = useAnimatedStyle(() => {
    const position: {
      top: number | "auto";
      bottom: number | "auto";
      left: number | "auto";
      right: number | "auto";
    } = {
      top: "auto",
      bottom: "auto",
      left: "auto",
      right: "auto",
    };

    switch (orientation.value) {
      case "portrait-down":
        position.bottom = 0;
        position.left = 0;
        break;
      case "landscape-left":
        position.top = 0;
        position.left = 0;
        break;
      case "landscape-right":
        position.bottom = 0;
        position.right = 0;
        break;
      case "portrait-up":
      default:
        position.top = 0;
        position.right = 0;
        break;
    }

    return {
      ...position,
      opacity: lockVisibility.value,
      transform: [
        {
          scale: lockVisibility.value,
        },
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  const back = React.useCallback(() => {
    _actionsVisibility.value = withTiming(0, {
      duration: actionsDuration,
    });

    backProp();
  }, [_actionsVisibility, backProp]);

  const countdownStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value}deg`,
      },
    ],
  }));

  return (
    <AnimatedView {...props} style={animatedStyle}>
      <AnimatedButton
        icon={ChevronLeft}
        onPress={back}
        size="$5"
        circular
        style={backStyle}
        position="absolute"
        m="$space.4"
        z={3}
      />
      {Platform.OS !== "web" && (
        <AnimatedButton
          icon={lockedOrientation ? LockKeyhole : UnlockKeyhole}
          onPress={lockOrientation}
          size="$5"
          circular
          style={lockStyle}
          position="absolute"
          m="$space.4"
          z={3}
        />
      )}
      <View
        position="relative"
        z={2}
        items="center"
        justify="center"
        flex={1}
        // TODO: Fix this in native
        style={{
          backgroundColor: colorVariant === "border" ? "black" : "transparent",
        }}
        pointerEvents="none"
      >
        <AnimatedView style={countdownStyle}>
          <Countdown
            duration={duration}
            color={textColor}
            fontSize={fontSize}
            opacity={showText ? 1 : 0.2}
          />
        </AnimatedView>
      </View>
      <GestureDetector gesture={gesture}>
        <View position="absolute" t={0} l={0} r={0} b={0} z={1} />
      </GestureDetector>
    </AnimatedView>
  );
});
