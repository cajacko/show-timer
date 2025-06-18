import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";
import getActionValue from "@/features/timers/getActionValue";
import { NumberButtonKey } from "@/features/number-pad/NumberPad";
import useAnimationLoop from "@/hooks/useAnimationLoop";
import stageValueToDuration from "@/utils/stageValueToDuration";

export type DurationTimerProps = TimerCommonProps;

const defaultOkayValue: StageValue = [0, 0, 5];
const defaultWarningValue: StageValue = [0, 0, 1];
const defaultAlertValue: StageValue = [0];

type State =
  | { type: "running"; finishAt: number }
  | { type: "paused"; secondsLeft: number }
  | { type: "stopped" };

function useTimerDuration(
  state: State,
  initDuration: SharedValue<number | null>
) {
  const enabled = state.type !== "stopped";

  const loop = useAnimationLoop(enabled);

  const duration = useDerivedValue<number | null>(() => {
    if (state.type === "paused") return state.secondsLeft;
    if (state.type === "stopped") return initDuration.value;

    const now = Date.now();

    // NOTE: We do display negative durations
    const secondsLeft = Math.floor((state.finishAt - now) / 1000);

    // loop.value is needed in here somewhere to ensure the derived value updates. But it's not
    // actually needed for the calculation. See above comments
    return loop.value ? secondsLeft : secondsLeft;
  });

  return duration;
}

export default React.memo(function DurationTimer({
  ...props
}: DurationTimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("okay");
  const [_okayValue, setOkayValue] =
    React.useState<StageValue>(defaultOkayValue);
  const [warningValue, setWarningValue] =
    React.useState<StageValue>(defaultWarningValue);
  const [_alertValue, setAlertValue] =
    React.useState<StageValue>(defaultAlertValue);
  const [state, setState] = React.useState<State>({
    type: "stopped",
  });
  const [stage, setStage] =
    React.useState<TimerScreenLayoutProps["stage"]>("okay");

  // The alert stage can not be empty
  const alertValue = React.useMemo(() => {
    if (_alertValue.length < 1) {
      return [0];
    }
    return _alertValue;
  }, [_alertValue]);

  // The okay stage can not be empty
  const okayValue = React.useMemo(() => {
    if (_okayValue.length < 1) {
      return [0];
    }
    return _okayValue;
  }, [_okayValue]);

  const warningDuration = React.useMemo(
    () => stageValueToDuration(warningValue),
    [warningValue]
  );

  const alertDuration = React.useMemo(
    () => stageValueToDuration(alertValue),
    [alertValue]
  );

  const initDuration = useSharedValue<number | null>(
    stageValueToDuration(okayValue)
  );

  React.useEffect(() => {
    initDuration.value = stageValueToDuration(okayValue);
  }, [okayValue, initDuration]);

  const setActiveValue =
    selectedStage === "warning"
      ? setWarningValue
      : selectedStage === "alert"
      ? setAlertValue
      : setOkayValue;

  const onNumberPadAction = React.useCallback<
    NonNullable<TimerScreenLayoutProps["onNumberPadAction"]>
  >(
    (action) => {
      setActiveValue((prevValue) => {
        const nextValue = getActionValue(prevValue, action, "duration");

        if (selectedStage === "warning") return nextValue;

        // The alert stage can not be empty
        if (nextValue.length < 1) return [0];

        return nextValue;
      });
    },
    [setActiveValue, selectedStage]
  );

  const duration = useTimerDuration(state, initDuration);

  const isDurationPastAlert = useDerivedValue(() => {
    if (duration.value === null || alertDuration === null) return false;

    return duration.value <= alertDuration;
  });

  const isDurationPastWarning = useDerivedValue(() => {
    if (duration.value === null || warningDuration === null) return false;

    return duration.value <= warningDuration;
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

  const activeValue =
    selectedStage === "warning"
      ? warningValue
      : selectedStage === "okay"
      ? okayValue
      : alertValue;

  const disabledButtons = React.useMemo((): NumberButtonKey[] | undefined => {
    if (activeValue.length === 6) {
      return ["double-zero", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    if (activeValue.length === 0) {
      return ["backspace", "double-zero", 0];
    }

    if (selectedStage === "warning") return undefined;

    if (activeValue.length === 1 && activeValue[0] === 0) {
      return ["backspace", 0, "double-zero"];
    }

    return undefined;
  }, [activeValue, selectedStage]);

  const start = React.useCallback(() => {
    setState((prevState) => {
      if (prevState.type === "running") return prevState;

      if (prevState.type === "paused") {
        return {
          type: "running",
          finishAt: Date.now() + prevState.secondsLeft * 1000, // Adjust start time based on paused duration
        };
      }

      if (initDuration.value === null) {
        return prevState;
      }

      return {
        type: "running",
        finishAt: Date.now() + initDuration.value * 1000,
      };
    });
  }, [initDuration]);

  const pause = React.useCallback(() => {
    setState(
      duration.value === null
        ? { type: "stopped" }
        : { type: "paused", secondsLeft: duration.value }
    );
  }, [duration]);

  const reset = React.useCallback(() => {
    setState({ type: "stopped" });
  }, []);

  const addMinute = React.useCallback(() => {
    setState((prevState) => {
      if (prevState.type === "running") {
        return {
          type: "running",
          finishAt: prevState.finishAt + 60 * 1000,
        };
      }

      return prevState;
    });
  }, []);

  return (
    <TimerScreenLayout
      okayValue={okayValue}
      warningValue={warningValue}
      alertValue={alertValue}
      stage={stage}
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      duration={duration}
      stageButtonVariant="duration"
      onNumberPadAction={onNumberPadAction}
      disabledButtons={disabledButtons}
      start={state.type !== "running" ? start : undefined}
      pause={state.type === "running" ? pause : undefined}
      reset={state.type !== "stopped" ? reset : undefined}
      addMinute={state.type === "running" ? addMinute : undefined}
      fullScreenButton={state.type === "running"}
      paused={state.type === "paused"}
      running={state.type === "running"}
      {...props}
    />
  );
});
