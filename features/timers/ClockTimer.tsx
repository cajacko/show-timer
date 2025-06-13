import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
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
import { NumberButtonValue } from "@/features/number-pad/NumberButton";
import { StageValue } from "@/features/stages/StageButton";

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

const nullValue: StageValue = [];

function getActionValue(
  prevValue: StageValue,
  action: NumberButtonValue
): StageValue {
  if (action.type === "clear") return nullValue;

  if (action.type === "backspace") {
    if (prevValue.length === 0) return nullValue;

    return prevValue.slice(0, -1);
  }

  if (action.type === "number") {
    const newValue = [action.value, ...prevValue];
    // Limit the value to 6 digits
    return newValue.length > 6 ? newValue.slice(0, 6) : newValue;
  }

  if (action.type === "double-zero") {
    // Add two zeros to the end of the value
    const newValue = [0, 0, ...prevValue];
    // Limit the value to 6 digits
    return newValue.length > 6 ? newValue.slice(0, 6) : newValue;
  }

  return prevValue;
}

export default React.memo(function ClockTimer({
  ...props
}: ClockTimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("warning");
  const [warningValue, setWarningValue] = React.useState<StageValue>(nullValue);
  const [alertValue, setAlertValue] = React.useState<StageValue>(nullValue);

  const duration = useClockDuration();

  const setActiveValue =
    selectedStage === "warning" ? setWarningValue : setAlertValue;

  const onNumberPadAction = React.useCallback<
    NonNullable<TimerScreenLayoutProps["onNumberPadAction"]>
  >(
    (action) => {
      setActiveValue((prevValue) => getActionValue(prevValue, action));
    },
    [setActiveValue]
  );

  return (
    <TimerScreenLayout
      duration={duration}
      warningValue={warningValue}
      alertValue={alertValue}
      stage="okay"
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      onNumberPadAction={onNumberPadAction}
      {...props}
    />
  );
});
