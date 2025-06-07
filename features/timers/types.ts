import { SharedValue } from "react-native-reanimated";

export interface TimerProps {
  duration: SharedValue<number>;
  progress: SharedValue<number>;
  height: SharedValue<number>;
  width: SharedValue<number>;
  pause?: () => void;
  resume?: () => void;
  reset?: () => void;
  start?: () => void;
  // stop?: () => void;
  // addTime?: (seconds: number) => void;
  back?: () => void;
  close?: () => void;
}
