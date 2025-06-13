import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";
import { TimerCommonProps } from "./Timer.types";
import { useSharedValue } from "react-native-reanimated";

export type DurationTimerProps = TimerCommonProps;

export default React.memo(function DurationTimer({
  ...props
}: DurationTimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("okay");

  const duration = useSharedValue<number | null>(120);

  return (
    <TimerScreenLayout
      okayValue="0"
      warningValue="0"
      alertValue="0"
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      duration={duration}
      {...props}
    />
  );
});
