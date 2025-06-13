import React from "react";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { Button, View, ViewProps } from "tamagui";
import Timer, {
  BorderTimerProps,
} from "@/features-2/timers/border-timer/BorderTimer";
import { useScrollablePagination } from "@/features/pagination/usePagination";
import { TimerState } from "@/features-2/timers/types";
import Indicators from "@/features/pagination/Indicators";
import { ChevronLeft, ChevronRight } from "@tamagui/lucide-icons";
import { Stage } from "@/features/stages/Stage.types";

export interface DisplaysScrollViewProps
  extends Omit<ViewProps, "height" | "width"> {
  height: SharedValue<number>;
  width: SharedValue<number>;
  pageWidth: number;
  duration: SharedValue<number | null>;
  stage: Stage;
}

const displays: {
  component: React.NamedExoticComponent<BorderTimerProps>;
  props: Partial<BorderTimerProps>;
}[] = [
  {
    component: Timer,
    props: {
      colorVariant: "border",
      showText: true,
    },
  },
  {
    component: Timer,
    props: {
      colorVariant: "background",
      showText: true,
    },
  },
  {
    component: Timer,
    props: {
      colorVariant: "background",
      showText: false,
    },
  },
];

export default React.memo(function DisplaysScrollView({
  height,
  width,
  pageWidth,
  duration,
  stage,
  ...props
}: DisplaysScrollViewProps): React.ReactNode {
  const { ScrollView, Page, scrollXOffset, previous, next } =
    useScrollablePagination({
      pageCount: displays.length,
      pageWidth,
    });

  const state = useSharedValue<TimerState>({ type: "stopped" });

  return (
    <View {...props}>
      <ScrollView>
        {displays.map(({ component: Component, props: componentProps }, i) => (
          <Page key={i}>
            <Component
              stage={stage}
              height={height}
              width={width}
              duration={duration}
              state={state}
              {...componentProps}
            />
          </Page>
        ))}
      </ScrollView>
      <View
        position="absolute"
        t={0}
        l="$space.2"
        b={0}
        items="center"
        justify="center"
      >
        <Button icon={ChevronLeft} size="$5" circular onPress={previous} />
      </View>
      <View
        position="absolute"
        r="$space.2"
        b={0}
        t={0}
        items="center"
        justify="center"
      >
        <Button icon={ChevronRight} size="$5" circular onPress={next} />
      </View>
      <View
        position="absolute"
        width="100%"
        b="$space.2"
        l={0}
        r={0}
        items="center"
        justify="center"
      >
        <Indicators
          b={0}
          pageCount={displays.length}
          scrollX={scrollXOffset}
          pageWidth={pageWidth}
        />
      </View>
    </View>
  );
});
