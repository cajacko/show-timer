import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import { runOnJS, useDerivedValue } from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";
import getActionValue from "./getActionValue";
import useAnimationLoop from "@/hooks/useAnimationLoop";
import stageValueToDuration from "@/utils/stageValueToDuration";

export type TimerProps = TimerCommonProps;

const defaultWarningValue: StageValue = [0, 0, 4];
const defaultAlertValue: StageValue = [0, 0, 5];

function useTimerDuration(startedAt: number | null) {
  const enabled = startedAt !== null;

  const loop = useAnimationLoop(enabled);

  const duration = useDerivedValue<number | null>(() => {
    if (startedAt === null) return null;
    const now = Date.now();

    const secondsElapsed = Math.floor((now - startedAt) / 1000);

    // loop.value is needed in here somewhere to ensure the derived value updates. But it's not
    // actually needed for the calculation. See above comments
    return loop.value ? secondsElapsed : secondsElapsed;
  });

  return duration;
}

export default React.memo(function Timer({
  ...props
}: TimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("warning");
  const [warningValue, setWarningValue] =
    React.useState<StageValue>(defaultWarningValue);
  const [alertValue, setAlertValue] =
    React.useState<StageValue>(defaultAlertValue);
  const [stage, setStage] =
    React.useState<TimerScreenLayoutProps["stage"]>("okay");

  const warningDuration = React.useMemo(
    () => stageValueToDuration(warningValue),
    [warningValue]
  );

  const alertDuration = React.useMemo(
    () => stageValueToDuration(alertValue),
    [alertValue]
  );

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

  const onStart = React.useCallback(() => {
    setStartedAt(Date.now());
  }, []);

  const [startedAt, setStartedAt] = React.useState<number | null>(null);

  const duration = useTimerDuration(startedAt);

  const isAlertPastDate = useDerivedValue(() => {
    if (duration.value === null || alertDuration === null) return false;
    return duration.value >= alertDuration;
  });

  const isWarningPastDate = useDerivedValue(() => {
    if (duration.value === null || warningDuration === null) return false;
    return duration.value >= warningDuration;
  });

  useDerivedValue(() => {
    if (isAlertPastDate.value) {
      runOnJS(setStage)("alert");
    } else if (isWarningPastDate.value) {
      runOnJS(setStage)("warning");
    } else {
      runOnJS(setStage)("okay");
    }
  });

  return (
    <TimerScreenLayout
      warningValue={warningValue}
      alertValue={alertValue}
      stage={stage}
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      duration={duration}
      onNumberPadAction={onNumberPadAction}
      stageButtonVariant="duration"
      onStart={onStart}
      {...props}
    />
  );
});
