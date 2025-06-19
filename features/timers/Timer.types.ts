import { TimerScreenLayoutProps } from "../timer-screen-layout/TimerScreenLayout";

export type TimerCommonProps = Omit<
  TimerScreenLayoutProps,
  "duration" | "stage" | "running" | "stageButtonVariant"
>;
