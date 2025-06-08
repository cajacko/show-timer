import React from "react";
import { SharedValue } from "react-native-reanimated";
import { View, ViewProps } from "tamagui";
import BorderTimer from "./border-timer/BorderTimer";
import { TimerProps } from "./types";

export type TimersProps = Omit<TimerProps, "height" | "width"> &
  Omit<ViewProps, keyof TimerProps> & {
    height: SharedValue<number>;
    width: SharedValue<number>;
  };

/**
 * Turn this into a horizontal scrollable list to select the timer you want to use
 */
export default React.memo(function Timers({
  duration,
  progress,
  start,
  reset,
  resume,
  pause,
  back,
  close,
  height,
  width,
  addTime,
  fullScreenAmount,
  stop,
  state,
  ...viewProps
}: TimersProps): React.ReactNode {
  return (
    <View {...viewProps}>
      <BorderTimer
        state={state}
        height={height}
        width={width}
        duration={duration}
        progress={progress}
        start={start}
        reset={reset}
        resume={resume}
        pause={pause}
        back={back}
        close={close}
        addTime={addTime}
        fullScreenAmount={fullScreenAmount}
        stop={stop}
      />
    </View>
  );
});
