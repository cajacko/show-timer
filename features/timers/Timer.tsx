import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import { useSharedValue } from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";
import getActionValue from "./getActionValue";

export type TimerProps = TimerCommonProps;

const defaultWarningValue: StageValue = [0, 0, 4];
const defaultAlertValue: StageValue = [0, 0, 5];

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

  const duration = useSharedValue<number | null>(0);

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
      {...props}
    />
  );
});
