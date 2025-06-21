import { Stage } from "@/features/stages/Stage.types";
import React from "react";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  withRepeat,
  interpolateColor,
  interpolate,
} from "react-native-reanimated";
import { Button, useTheme, View, ViewProps } from "tamagui";
import Countdown, { CountdownProps } from "@/features/countdown/Countdown";
import stageColors from "@/features/stages/stageColors";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { ChevronLeft, LockKeyhole, UnlockKeyhole } from "@tamagui/lucide-icons";
import {
  Orientation,
  useOrientation,
} from "@/features/orientation/OrientationContext";
import { Platform } from "react-native";
import Color from "color";
import TimerActions, {
  TimerActionsProps,
  useTimerActionSize,
} from "@/features/timer-actions/TimerActions";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedButton = Animated.createAnimatedComponent(Button);

const flashAlpha = 0.25;
const flashEnabled: boolean = false;
const actionsDuration = 300;
const showActionsDuration = 3000;
const actionsMargin = 10;
const countdownSideMargin = 20;

export interface DisplayProps
  extends Omit<ViewProps, "height" | "width" | "start" | "debug">,
    Pick<
      TimerActionsProps,
      "start" | "pause" | "reset" | "addMinute" | "fullScreen"
    >,
    Pick<CountdownProps, "type" | "debug" | "secondsVariant"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  back: () => void;
  colorVariant?: "border" | "background";
  showText?: boolean;
  stage: Stage;
  onPress?: () => { handled: boolean };
  duration: SharedValue<number | null>;
  fullScreenAmount: SharedValue<number>;
  flash?: boolean;
  running: boolean;
}

function usePauseEffects({
  flash: flashProp = false,
  stage,
  colorVariant,
}: Pick<DisplayProps, "flash" | "stage" | "colorVariant">) {
  const flash: boolean = flashEnabled && flashProp;
  const flashOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (flash) {
      flashOpacity.value = withRepeat(
        withTiming(0, { duration: 800 }),
        -1,
        true
      );
    } else {
      flashOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [flash, flashOpacity]);

  const theme = useTheme();
  const backgroundColor = theme[stageColors[stage].background]?.val;
  const textColor =
    theme[colorVariant === "background" ? stageColors[stage].text : "$white1"]
      ?.val;

  const backgroundColorFlash = React.useMemo(
    () => Color(backgroundColor).alpha(flashAlpha).toString(),
    [backgroundColor]
  );

  const textFlashColor = React.useMemo(
    () => Color(textColor).alpha(flashAlpha).toString(),
    [textColor]
  );

  const textColorAnimation = useDerivedValue(() => {
    return interpolateColor(
      flashOpacity.value,
      [0, 1],
      [textFlashColor, textColor]
    );
  });

  const backgroundColorAnimation = useDerivedValue(() => {
    return interpolateColor(
      flashOpacity.value,
      [0, 1],
      [backgroundColorFlash, backgroundColor]
    );
  });

  return {
    textColorAnimation,
    backgroundColorAnimation,
  };
}

function useDisplayOrientation({
  fullScreenAmount,
  actionsVisibility,
}: Pick<DisplayProps, "fullScreenAmount"> & {
  actionsVisibility: SharedValue<number>;
}) {
  const {
    lockOrientation: _lockOrientation,
    lockedOrientation,
    orientation: _orientation,
  } = useOrientation();

  const _lockVisibility = useSharedValue<number>(0);

  const lockOrientation = React.useCallback(() => {
    if (lockedOrientation) {
      _lockOrientation(null);
    } else {
      _lockOrientation(_orientation);
    }
  }, [_lockOrientation, lockedOrientation, _orientation]);

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

  const lockVisibility = useDerivedValue(() => {
    if (fullScreenAmount.value !== 1) return fullScreenAmount.value;

    return interpolate(
      actionsVisibility.value,
      [0, 1],
      [_lockVisibility.value, actionsVisibility.value]
    );
  });

  const orientation = useDerivedValue<Orientation>(() => {
    if (fullScreenAmount.value <= 0.5) {
      return "portrait-up";
    }

    return lockedOrientation ?? _orientation;
  });

  const rotation = useDerivedValue<number>(() => {
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

  return {
    lockOrientation,
    lockedOrientation,
    orientation,
    rotation,
    lockVisibility,
  };
}

function useActionVisibility({
  running,
  fullScreenAmount,
  onPress,
  back: backProp,
}: Pick<DisplayProps, "running" | "fullScreenAmount" | "onPress" | "back">) {
  const tappedVisibility = useSharedValue<number>(0);

  const backVisibility = useDerivedValue<number>(() => {
    const fullScreenValue = running ? tappedVisibility.value : 1;

    return interpolate(fullScreenAmount.value, [0, 1], [0, fullScreenValue]);
  });

  const hideActionsTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const actionsVisibility = useDerivedValue<number>(() => {
    const fullScreenValue = running ? tappedVisibility.value : 1;

    return interpolate(fullScreenAmount.value, [0, 1], [1, fullScreenValue]);
  });

  const fullScreenButtonVisibility = useDerivedValue<number>(() => {
    return interpolate(fullScreenAmount.value, [0, 1], [1, 0]);
  });

  const hideActions = React.useCallback(() => {
    tappedVisibility.value = withTiming(0, {
      duration: actionsDuration,
    });
  }, [tappedVisibility]);

  const showActions = React.useCallback(() => {
    if (hideActionsTimeout.current) {
      clearTimeout(hideActionsTimeout.current);
    }

    tappedVisibility.value = withTiming(1, {
      duration: actionsDuration,
    });

    hideActionsTimeout.current = setTimeout(hideActions, showActionsDuration);
  }, [tappedVisibility, hideActions]);

  const onTap = React.useCallback(() => {
    const { handled } = onPress?.() || {};

    if (handled) {
      return;
    }

    if (tappedVisibility.value === 1) {
      hideActions();
    } else {
      showActions();
    }
  }, [onPress, tappedVisibility, showActions, hideActions]);

  const gesture = React.useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        runOnJS(onTap)();
      }),
    [onTap]
  );

  const back = React.useCallback(() => {
    hideActions();
    backProp();
  }, [hideActions, backProp]);

  return {
    actionsVisibility,
    gesture,
    back,
    backVisibility,
    fullScreenButtonVisibility,
  };
}

function useStyle({
  height,
  width,
  colorVariant,
  backgroundColorFlash,
  orientation,
  rotation,
  lockVisibility,
  backVisibility,
}: Pick<DisplayProps, "height" | "width" | "colorVariant"> & {
  backgroundColorFlash: SharedValue<string>;
  orientation: SharedValue<Orientation>;
  rotation: SharedValue<number>;
  lockVisibility: SharedValue<number>;
  backVisibility: SharedValue<number>;
}) {
  const { buttonSize, height: actionsHeight } = useTimerActionSize();

  const borderSize = useDerivedValue(() => {
    const minSize = Math.min(height.value, width.value);

    return colorVariant === "border" ? Math.round(minSize * 0.03) : 0;
  });

  const containerStyle = useAnimatedStyle(() => ({
    height: height.value,
    width: width.value,
    padding: borderSize.value,
    backgroundColor: backgroundColorFlash.value,
  }));

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
      opacity: backVisibility.value,
      transform: [
        {
          scale: backVisibility.value,
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

  const contentStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  const actionHeightAllowance = actionsHeight + actionsMargin * 2;

  const countdownAvailableHeight = useDerivedValue(() => {
    if (
      orientation.value === "landscape-left" ||
      orientation.value === "landscape-right"
    ) {
      return width.value - actionHeightAllowance * 2 - borderSize.value * 2;
    }

    return height.value - actionHeightAllowance * 2 - borderSize.value * 2;
  });

  const countdownAvailableWidth = useDerivedValue(() => {
    if (
      orientation.value === "landscape-left" ||
      orientation.value === "landscape-right"
    ) {
      return height.value - countdownSideMargin * 2 - borderSize.value * 2;
    }

    return width.value - countdownSideMargin * 2 - borderSize.value * 2;
  });

  return {
    lockStyle,
    backStyle,
    containerStyle,
    buttonSize,
    contentStyle,
    actionsHeight,
    countdownAvailableHeight,
    countdownAvailableWidth,
    actionHeightAllowance,
  };
}

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
  flash: flashProp = false,
  start,
  pause,
  reset,
  addMinute,
  running,
  type,
  fullScreen,
  debug = false,
  secondsVariant,
  ...props
}: DisplayProps): React.ReactNode {
  const { textColorAnimation, backgroundColorAnimation: backgroundColorFlash } =
    usePauseEffects({ flash: flashProp, stage, colorVariant });

  const {
    actionsVisibility,
    gesture,
    back,
    backVisibility,
    fullScreenButtonVisibility,
  } = useActionVisibility({
    back: backProp,
    fullScreenAmount,
    running,
    onPress,
  });

  const {
    lockOrientation,
    lockedOrientation,
    orientation,
    rotation,
    lockVisibility,
  } = useDisplayOrientation({ fullScreenAmount, actionsVisibility });

  const duration = useDerivedValue<number | null>(
    () => (durationProp.value === null ? 0 : durationProp.value),
    [durationProp]
  );

  const styles = useStyle({
    backVisibility,
    backgroundColorFlash,
    height,
    lockVisibility,
    orientation,
    rotation,
    width,
    colorVariant,
  });

  return (
    <AnimatedView {...props} style={styles.containerStyle}>
      <AnimatedButton
        icon={ChevronLeft}
        onPress={back}
        size={styles.buttonSize}
        circular
        style={styles.backStyle}
        position="absolute"
        m={actionsMargin}
        z={3}
      />
      {Platform.OS !== "web" && (
        <AnimatedButton
          icon={lockedOrientation ? LockKeyhole : UnlockKeyhole}
          onPress={lockOrientation}
          size={styles.buttonSize}
          circular
          style={styles.lockStyle}
          position="absolute"
          m={actionsMargin}
          z={3}
        />
      )}
      <View
        position="relative"
        z={2}
        items="center"
        justify="center"
        flex={1}
        bg={colorVariant === "border" ? "$black1" : "transparent"}
        pointerEvents="box-none"
      >
        <AnimatedView
          style={styles.contentStyle}
          items="center"
          justify="center"
          pointerEvents="box-none"
        >
          <Countdown
            duration={duration}
            color={textColorAnimation}
            opacity={showText ? 1 : 0.2}
            type={type}
            pointerEvents="none"
            mt={styles.actionHeightAllowance}
            availableHeight={styles.countdownAvailableHeight}
            availableWidth={styles.countdownAvailableWidth}
            debug={debug}
            secondsVariant={secondsVariant}
          />
          <TimerActions
            fullScreen={fullScreen}
            start={start}
            pause={pause}
            addMinute={addMinute}
            reset={reset}
            visibility={actionsVisibility}
            fullScreenVisibility={fullScreenButtonVisibility}
            my={actionsMargin}
          />
        </AnimatedView>
      </View>
      <GestureDetector gesture={gesture}>
        <View position="absolute" t={0} l={0} r={0} b={0} z={1} />
      </GestureDetector>
    </AnimatedView>
  );
});
