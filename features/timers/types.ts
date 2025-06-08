import { SharedValue } from "react-native-reanimated";

export type TimerState = "running" | "paused" | "stopped";

export interface TimerControls {
  duration: SharedValue<number>;
  progress: SharedValue<number>;
  state: SharedValue<TimerState>;
  pause?: () => void;
  resume?: () => void;
  reset?: () => void;
  start?: () => void;
  stop?: () => void;
  addTime?: (seconds: number) => void;
}

export interface TimerProps extends TimerControls {
  height: SharedValue<number>;
  width: SharedValue<number>;
  fullScreenAmount: SharedValue<number>;
  back?: () => void;
  close?: () => void;
}
