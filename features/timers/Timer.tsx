import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import { useSharedValue } from "react-native-reanimated";
import { StageValue } from "@/features/stages/StageButton";

export type TimerProps = TimerCommonProps;

const nullValue: StageValue = [];

export default React.memo(function Timer({
  ...props
}: TimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("warning");

  const duration = useSharedValue<number | null>(120);

  return (
    <TimerScreenLayout
      warningValue={nullValue}
      alertValue={nullValue}
      stage="okay"
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      duration={duration}
      {...props}
    />
  );
});
