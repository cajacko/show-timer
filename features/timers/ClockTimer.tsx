import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
  fullScreenDuration,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";
import getActionValue, { nullValue } from "./getActionValue";
import { NumberButtonKey } from "@/features/number-pad/NumberPad";
import useAnimationLoop from "@/hooks/useAnimationLoop";

export type ClockTimerProps = TimerCommonProps;

export function useClockDuration(props?: {
  enabled?: boolean;
}): SharedValue<number | null> {
  const enabled = props?.enabled ?? true;
  const loop = useAnimationLoop(enabled);

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

  return duration;
}

function useIsClockDurationPastDate(
  duration: SharedValue<number | null>,
  date: string | null
): SharedValue<boolean | null> {
  const isPastDate = useDerivedValue(() => {
    if (!date) return null;
    if (duration.value === null) return null;

    const dateTime = new Date(date).getTime();

    // Get the now time from the clock duration. This is the opposite of the transform we do in
    // useClockDuration to convert the 24-hour clock to seconds.
    const now = new Date();
    const hours = Math.floor(duration.value / 3600);
    const minutes = Math.floor((duration.value % 3600) / 60);
    const seconds = duration.value % 60;
    now.setHours(hours, minutes, seconds, 0);

    const isPastDate = now.getTime() >= dateTime;

    return isPastDate;
  });

  return isPastDate;
}

function stageValueToDate(value: StageValue): string | null {
  if (value.length !== 6) return null;

  const [sec2, sec1, min2, min1, hours2, hours1] = value;

  const hours = parseInt(`${hours1}${hours2}`, 10);
  const minutes = parseInt(`${min1}${min2}`, 10);
  const seconds = parseInt(`${sec1}${sec2}`, 10);

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;

  const now = new Date();
  now.setHours(hours, minutes, seconds, 0);

  return now.toISOString();
}

export default React.memo(function ClockTimer({
  fullScreenAmount,
  ...props
}: ClockTimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("warning");
  const [warningValue, setWarningValue] = React.useState<StageValue>(nullValue);
  const [alertValue, setAlertValue] = React.useState<StageValue>(nullValue);
  const [stage, setStage] =
    React.useState<TimerScreenLayoutProps["stage"]>("okay");

  const duration = useClockDuration();

  const warningDate = React.useMemo(
    () => stageValueToDate(warningValue),
    [warningValue]
  );

  const alertDate = React.useMemo(
    () => stageValueToDate(alertValue),
    [alertValue]
  );

  const isWarningPastDate = useIsClockDurationPastDate(duration, warningDate);
  const isAlertPastDate = useIsClockDurationPastDate(duration, alertDate);

  useDerivedValue(() => {
    if (isAlertPastDate.value) {
      runOnJS(setStage)("alert");
    } else if (isWarningPastDate.value) {
      runOnJS(setStage)("warning");
    } else {
      runOnJS(setStage)("okay");
    }
  });

  const setActiveValue =
    selectedStage === "warning" ? setWarningValue : setAlertValue;
  const activeValue = selectedStage === "warning" ? warningValue : alertValue;

  const onNumberPadAction = React.useCallback<
    NonNullable<TimerScreenLayoutProps["onNumberPadAction"]>
  >(
    (action) => {
      setActiveValue((prevValue) => getActionValue(prevValue, action, "time"));
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
      stage={stage}
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      onNumberPadAction={onNumberPadAction}
      stageButtonVariant="time"
      onPressDisplay={onPressDisplay}
      fullScreenAmount={fullScreenAmount}
      disabledButtons={disabledButtons}
      fullScreenButton
      running
      {...props}
    />
  );
});
