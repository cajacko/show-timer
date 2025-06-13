import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import { useSharedValue } from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";
import getActionValue from "@/features/timers/getActionValue";

export type DurationTimerProps = TimerCommonProps;

const defaultOkayValue: StageValue = [0, 0, 5];
const defaultWarningValue: StageValue = [0, 0, 1];
const defaultAlertValue: StageValue = [0];

export default React.memo(function DurationTimer({
  ...props
}: DurationTimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("okay");

  const [okayValue, setOkayValue] =
    React.useState<StageValue>(defaultOkayValue);

  const [warningValue, setWarningValue] =
    React.useState<StageValue>(defaultWarningValue);
  const [_alertValue, setAlertValue] =
    React.useState<StageValue>(defaultAlertValue);

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
        const nextValue = getActionValue(prevValue, action);

        if (selectedStage !== "alert") return nextValue;

        // The alert stage can not be empty
        if (nextValue.length < 1) return [0];

        return nextValue;
      });
    },
    [setActiveValue, selectedStage]
  );

  const duration = useSharedValue<number | null>(5 * 60);

  // The alert stage can not be empty
  const alertValue = React.useMemo(() => {
    if (_alertValue.length < 1) {
      return [0];
    }
    return _alertValue;
  }, [_alertValue]);

  return (
    <TimerScreenLayout
      okayValue={okayValue}
      warningValue={warningValue}
      alertValue={alertValue}
      stage="okay"
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      duration={duration}
      stageButtonVariant="duration"
      onNumberPadAction={onNumberPadAction}
      {...props}
    />
  );
});
