import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import { useDerivedValue } from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";
import getActionValue from "./getActionValue";
import useAnimationLoop from "@/hooks/useAnimationLoop";

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

  return (
    <TimerScreenLayout
      warningValue={warningValue}
      alertValue={alertValue}
      stage="okay"
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
