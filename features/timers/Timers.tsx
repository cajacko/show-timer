import React from "react";
import { SharedValue } from "react-native-reanimated";
import { View, ViewProps } from "tamagui";
import BorderTimer from "./border-timer/BorderTimer";
import { TimerProps } from "./types";

export type TimersProps = Omit<TimerProps, "height" | "width"> &
  Omit<ViewProps, "height" | "width"> & {
    height: SharedValue<number>;
    width: SharedValue<number>;
  };

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
  ...viewProps
}: TimersProps): React.ReactNode {
  return (
    <View {...viewProps}>
      <BorderTimer
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
      />
    </View>
  );
});
