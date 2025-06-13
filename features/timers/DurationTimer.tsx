import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";

export interface DurationTimerProps extends TimerScreenLayoutProps {}

export default React.memo(function DurationTimer({
  ...props
}: DurationTimerProps): React.ReactNode {
  const [selectedStage, setSelectedStage] =
    React.useState<TimerScreenLayoutProps["selectedStage"]>("okay");

  return (
    <TimerScreenLayout
      okayValue="0"
      warningValue="0"
      alertValue="0"
      selectedStage={selectedStage}
      onChangeSelectedStage={setSelectedStage}
      {...props}
    ></TimerScreenLayout>
  );
});
