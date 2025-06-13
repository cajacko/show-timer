import { Stage } from "@/features/stages/Stage.types";
import { DerivedValue, SharedValue } from "react-native-reanimated";

export type TimerState =
  | { type: "running"; endDate: number }
  | { type: "stopped" }
  | { type: "paused"; secondsLeft: number };

export interface TimerControls {
  duration: DerivedValue<number | null>;
  state: DerivedValue<TimerState>;
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
  fullScreenAmount?: SharedValue<number>;
  back?: () => void;
  close?: () => void;
  colorVariant?: "border" | "background";
  showText?: boolean;
  stage: Stage;
}
