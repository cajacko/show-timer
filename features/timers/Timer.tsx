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
import { NumberButtonKey } from "@/features/number-pad/NumberPad";

export type TimerProps = TimerCommonProps;

const defaultWarningValue: StageValue = [0, 0, 4];
const defaultAlertValue: StageValue = [0, 0, 5];

type State =
  | { type: "running"; startedAt: number }
  | { type: "paused"; duration: number }
  | { type: "stopped" };

function useTimerDuration(state: State) {
  const enabled = state.type !== "stopped";

  const loop = useAnimationLoop(enabled);

  const duration = useDerivedValue<number | null>(() => {
    if (state.type === "stopped") return null;
    if (state.type === "paused") return state.duration;

    const now = Date.now();

    const secondsElapsed = Math.floor((now - state.startedAt) / 1000);

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

  const [state, setState] = React.useState<State>({
    type: "stopped",
  });

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
      setActiveValue((prevValue) =>
        getActionValue(prevValue, action, "duration")
      );
    },
    [setActiveValue]
  );

  const start = React.useCallback(() => {
    setState((prevState) => {
      if (prevState.type === "running") return prevState;

      if (prevState.type === "paused") {
        return {
          type: "running",
          startedAt: Date.now() - prevState.duration * 1000, // Adjust start time based on paused duration
        };
      }

      return { type: "running", startedAt: Date.now() };
    });
  }, []);

  const duration = useTimerDuration(state);

  const isDurationPastAlert = useDerivedValue(() => {
    if (duration.value === null || alertDuration === null) return false;
    return duration.value >= alertDuration;
  });

  const isDurationPastWarning = useDerivedValue(() => {
    if (duration.value === null || warningDuration === null) return false;
    return duration.value >= warningDuration;
  });

  useDerivedValue(() => {
    if (isDurationPastAlert.value) {
      runOnJS(setStage)("alert");
    } else if (isDurationPastWarning.value) {
      runOnJS(setStage)("warning");
    } else {
      runOnJS(setStage)("okay");
    }
  });

  const reset = React.useCallback(() => {
    setState({ type: "stopped" });
  }, []);

  const pause = React.useCallback(() => {
    setState(
      duration.value === null
        ? { type: "stopped" }
        : { type: "paused", duration: duration.value }
    );
  }, [duration]);

  const activeValue = selectedStage === "warning" ? warningValue : alertValue;

  const disabledButtons = React.useMemo((): NumberButtonKey[] | undefined => {
    if (activeValue.length === 6) {
      return ["double-zero", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    if (activeValue.length === 0) {
      return ["backspace", "double-zero", 0];
    }

    return undefined;
  }, [activeValue]);

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
      start={state.type !== "running" ? start : undefined}
      reset={state.type !== "stopped" ? reset : undefined}
      pause={state.type === "running" ? pause : undefined}
      fullScreenButton={state.type === "running"}
      disabledButtons={disabledButtons}
      paused={state.type === "paused"}
      running={state.type === "running"}
      {...props}
    />
  );
});
