import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
  fullScreenDuration,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import {
  cancelAnimation,
  Easing,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";
import getActionValue, { nullValue } from "./getActionValue";
import { NumberButtonKey } from "@/features/number-pad/NumberPad";

export type ClockTimerProps = TimerCommonProps;

export function useClockDuration(
  enabled: boolean = true
): SharedValue<number | null> {
  // Loop is only used to force the duration useDerivedValue to update and get calculate the value
  // based off the Date.now() and the endDate. This means we don't have ensure our withTiming call
  // is exactly right and still works when the user closes the app and reopens it. A timer only
  // cares about it's end date, not the exact timing of the animation. This is much more accurate
  // and reliable than using withTiming directly on the duration.
  const loop = useSharedValue<number | null>(0);

  // To format the clock as a duration we need to convert the 24-hour clock to seconds e.g.
  // 2:30pm and 5 seconds needs to display as 14:30:05, which is a duration of 14 hours, 30 minutes,
  // and 5 seconds. which is 14 * 3600 + 30 * 60 + 5 = 52305 seconds.
  const duration = useDerivedValue<number | null>(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const value = hours * 3600 + minutes * 60 + seconds;

    // loop.value is needed in here somewhere to ensure the derived value updates. But it's not
    // actually needed for the calculation. See above comments
    return loop.value ? value : value;
  });

  React.useEffect(() => {
    if (!enabled) {
      cancelAnimation(loop);
      loop.value = null;
    } else {
      loop.value = 0;

      loop.value = withRepeat(
        withTiming(0, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1, // Infinite loop
        false // Do not reverse
      );
    }
  }, [enabled, loop]);

  return duration;
}

export default React.memo(function ClockTimer({
  fullScreenAmount,
  ...props
}: ClockTimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("warning");
  const [warningValue, setWarningValue] = React.useState<StageValue>(nullValue);
  const [alertValue, setAlertValue] = React.useState<StageValue>(nullValue);

  const duration = useClockDuration();

  const setActiveValue =
    selectedStage === "warning" ? setWarningValue : setAlertValue;
  const activeValue = selectedStage === "warning" ? warningValue : alertValue;

  const onNumberPadAction = React.useCallback<
    NonNullable<TimerScreenLayoutProps["onNumberPadAction"]>
  >(
    (action) => {
      setActiveValue((prevValue) => getActionValue(prevValue, action));
    },
    [setActiveValue]
  );

  const onPressDisplay = React.useCallback<
    NonNullable<TimerScreenLayoutProps["onPressDisplay"]>
  >(() => {
    if (fullScreenAmount.value === 0) {
      fullScreenAmount.value = withTiming(1, {
        duration: fullScreenDuration,
      });

      return {
        handled: true,
      };
    }

    return {
      handled: false,
    };
  }, [fullScreenAmount]);

  const disabledButtons = React.useMemo((): NumberButtonKey[] | undefined => {
    switch (activeValue.length) {
      case 0:
        return [3, 4, 5, 6, 7, 8, 9, "backspace"];
      case 1:
      case 2:
      case 4:
        return [6, 7, 8, 9];
      case 6:
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "double-zero"];
      default:
        return undefined;
    }
  }, [activeValue]);

  return (
    <TimerScreenLayout
      duration={duration}
      warningValue={warningValue}
      alertValue={alertValue}
      stage="okay"
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      onNumberPadAction={onNumberPadAction}
      stageButtonVariant="clock"
      onPressDisplay={onPressDisplay}
      fullScreenAmount={fullScreenAmount}
      disabledButtons={disabledButtons}
      {...props}
    />
  );
});
