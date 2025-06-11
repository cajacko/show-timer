import React from "react";
import TimerScreenLayout, {
  TimerScreenLayoutProps,
} from "../timer-screen-layout/TimerScreenLayout";

export interface DurationTimerProps
  extends Pick<TimerScreenLayoutProps, "height" | "width"> {}

export default React.memo(function DurationTimer({
  ...props
}: DurationTimerProps): React.ReactNode {
  return <TimerScreenLayout {...props}></TimerScreenLayout>;
});
