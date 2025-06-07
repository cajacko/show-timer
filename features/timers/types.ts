import { SharedValue } from "react-native-reanimated";

export interface TimerControls {
  duration: SharedValue<number>;
  progress: SharedValue<number>;
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
  back?: () => void;
  close?: () => void;
}
