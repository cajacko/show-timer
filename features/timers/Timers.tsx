import React from "react";
import { ViewProps as RNViewProps } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { View, ViewProps } from "tamagui";
import BorderTimer from "./border-timer/BorderTimer";
import { TimerProps } from "./types";

export type TimersProps = Omit<TimerProps, "height" | "width"> & ViewProps;

export default React.memo(function Timers({
  duration,
  progress,
  start,
  reset,
  resume,
  pause,
  back,
  close,
  ...viewProps
}: TimersProps): React.ReactNode {
  const height = useSharedValue(200); // Default height
  const width = useSharedValue(100); // Default width

  const [hasLayout, setHasLayout] = React.useState(false);
  const hasLayoutRef = React.useRef(hasLayout);
  hasLayoutRef.current = hasLayout;

  const onLayout = React.useCallback<NonNullable<RNViewProps["onLayout"]>>(
    (event) => {
      const { width: newWidth, height: newHeight } = event.nativeEvent.layout;

      width.value = newWidth;
      height.value = newHeight;

      if (!hasLayoutRef.current) {
        setHasLayout(true);
      }
    },
    [width, height]
  );

  return (
    <View {...viewProps} onLayout={onLayout}>
      {hasLayout && (
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
      )}
    </View>
  );
});
