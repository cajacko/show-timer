import {
  Maximize2,
  Pause,
  Play,
  Plus,
  RefreshCcw,
} from "@tamagui/lucide-icons";
import React from "react";
import { View, ViewProps, Button } from "tamagui";

export interface TimerActionsProps extends Omit<ViewProps, "start"> {
  fullScreen?: () => void;
  start?: () => void;
  pause?: () => void;
  addMinute?: () => void;
  reset?: () => void;
}

const mx = "$space.2";

export default React.memo(function TimerActions({
  fullScreen,
  start,
  pause,
  addMinute,
  reset,
  ...props
}: TimerActionsProps): React.ReactNode {
  return (
    <View flexDirection="row" {...props}>
      {fullScreen && (
        <Button
          icon={Maximize2}
          size="$5"
          onPress={fullScreen}
          circular
          mx={mx}
        />
      )}
      {start && (
        <Button icon={Play} size="$5" onPress={start} circular mx={mx} />
      )}
      {pause && (
        <Button icon={Pause} size="$5" onPress={pause} circular mx={mx} />
      )}
      {addMinute && (
        <Button icon={Plus} size="$5" onPress={addMinute} circular mx={mx} />
      )}
      {reset && (
        <Button icon={RefreshCcw} size="$5" onPress={reset} circular mx={mx} />
      )}
    </View>
  );
});
