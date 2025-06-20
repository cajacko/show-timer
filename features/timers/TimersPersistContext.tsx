import * as z from "zod/v4";
import React from "react";
import { timerState, durationState } from "./Timer.types";
import { StageValue, stageValue } from "@/features/stages/StageButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nullValue } from "@/features/timers/getActionValue";

const storageKey = "timersPersist";
const maxUpdateFrequency = 1000;

const timerDefaultWarningValue: StageValue = [0, 0, 4];
const timerDefaultAlertValue: StageValue = [0, 0, 5];

const durationDefaultOkayValue: StageValue = [0, 0, 5];
const durationDefaultWarningValue: StageValue = [0, 0, 1];
const durationDefaultAlertValue: StageValue = [0];

const timerContext = z.object({
  warning: stageValue,
  alert: stageValue,
  state: timerState,
});

type TimerContext = z.infer<typeof timerContext>;

const durationContext = z.object({
  okay: stageValue,
  warning: stageValue,
  alert: stageValue,
  state: durationState,
});

type DurationContext = z.infer<typeof durationContext>;

const clockContext = z.object({
  warning: stageValue,
  alert: stageValue,
});

type ClockContext = z.infer<typeof clockContext>;

type Update = (
  props:
    | { type: "timer"; payload: TimerContext }
    | { type: "duration"; payload: DurationContext }
    | { type: "clock"; payload: ClockContext }
) => void;

const storedData = z.object({
  timer: timerContext,
  duration: durationContext,
  clock: clockContext,
});

type StoredData = z.infer<typeof storedData>;

const defaultData: StoredData = {
  timer: {
    warning: timerDefaultWarningValue,
    alert: timerDefaultAlertValue,
    state: { type: "stopped" },
  },
  duration: {
    okay: durationDefaultOkayValue,
    warning: durationDefaultWarningValue,
    alert: durationDefaultAlertValue,
    state: { type: "stopped" },
  },
  clock: {
    warning: nullValue,
    alert: nullValue,
  },
};

type TimersPersistContextType = StoredData & {
  update: Update;
};

const TimersPersistContext =
  React.createContext<TimersPersistContextType | null>(null);

export function useTimerPersist(): TimersPersistContextType {
  const context = React.useContext(TimersPersistContext);

  if (!context) {
    throw new Error(
      "useTimerPersist must be used within a TimersPersistProvider"
    );
  }

  return context;
}

export function TimersPersistProvider({
  children,
  onReady,
}: {
  children: React.ReactNode;
  onReady?: () => void;
}): React.ReactElement {
  const [data, setData] = React.useState<StoredData>();

  const latestData = React.useRef<StoredData>(defaultData);
  const pendingData = React.useRef<StoredData | null>(null);

  React.useEffect(() => {
    let inflight = false;

    setInterval(() => {
      if (inflight) return;

      const dataToSet: StoredData | null = pendingData.current;

      if (!dataToSet) return;

      pendingData.current = null;
      inflight = true;

      AsyncStorage.setItem(storageKey, JSON.stringify(dataToSet)).finally(
        () => {
          inflight = false;
        }
      );
    }, maxUpdateFrequency);
  }, []);

  const update = React.useCallback<Update>((action) => {
    latestData.current = {
      ...latestData.current,
      [action.type]: action.payload,
    };

    pendingData.current = latestData.current;
  }, []);

  const value = React.useMemo<TimersPersistContextType | null>(
    () =>
      data
        ? {
            ...data,
            update,
          }
        : null,
    [update, data]
  );

  React.useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((item): StoredData => {
        if (!item) {
          return defaultData;
        }

        try {
          const result = storedData.safeParse(JSON.parse(item));

          if (result.success) {
            return result.data;
          }

          return defaultData;
        } catch {
          return defaultData;
        }
      })
      .catch(() => {
        return defaultData;
      })
      .then((storedData) => {
        latestData.current = storedData;
        setData(storedData);
      });
  }, []);

  React.useEffect(() => {
    if (!data) return;

    onReady?.();
  }, [data, onReady]);

  return (
    <TimersPersistContext.Provider value={value}>
      {value && children}
    </TimersPersistContext.Provider>
  );
}
