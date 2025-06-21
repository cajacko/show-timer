import { TimerScreenLayoutProps } from "../timer-screen-layout/TimerScreenLayout";
import * as z from "zod/v4";

export type TimerCommonProps = Omit<
  TimerScreenLayoutProps,
  "duration" | "stage" | "running" | "stageButtonVariant" | "type"
>;

export const timerState = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("running"),
    startedAt: z.number(),
  }),
  z.object({
    type: z.literal("paused"),
    duration: z.number(),
  }),
  z.object({
    type: z.literal("stopped"),
  }),
]);

export type TimerState = z.infer<typeof timerState>;

export const durationState = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("running"),
    finishAt: z.number(),
  }),
  z.object({
    type: z.literal("paused"),
    secondsLeft: z.number(),
  }),
  z.object({
    type: z.literal("stopped"),
  }),
]);

export type DurationState = z.infer<typeof durationState>;
