import React from "react";
import { DeviceMotion } from "expo-sensors";
import { Platform } from "react-native";

export type Orientation =
  | "portrait-up"
  | "landscape-left"
  | "landscape-right"
  | "portrait-down";

type ContextType = {
  orientation: Orientation;
  lockOrientation: (orientation: Orientation | null) => void;
  lockedOrientation: Orientation | null;
};

export const OrientationContext = React.createContext<ContextType>({
  orientation: "portrait-up",
  lockOrientation: () => {},
  lockedOrientation: null,
});

export function useOrientation(): ContextType {
  const context = React.useContext(OrientationContext);

  return context;
}

export const OrientationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [orientation, setOrientation] =
    React.useState<Orientation>("portrait-up");
  const [lockedOrientation, setLockedOrientation] =
    React.useState<Orientation | null>(null);

  React.useEffect(() => {
    if (Platform.OS === "web") return;

    DeviceMotion.setUpdateInterval(200);

    const subscription = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;

      const { beta, gamma } = rotation;
      const degBeta = beta * (180 / Math.PI);
      const degGamma = gamma * (180 / Math.PI);

      // Decide based on dominant axis
      if (degGamma > 60) {
        setOrientation("landscape-left");
      } else if (degGamma < -60) {
        setOrientation("landscape-right");
      } else if (degBeta > 60) {
        setOrientation("portrait-up");
      } else if (degBeta < -60) {
        setOrientation("portrait-down");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const value = React.useMemo(
    () => ({
      orientation,
      lockOrientation: setLockedOrientation,
      lockedOrientation,
    }),
    [orientation, lockedOrientation]
  );

  return (
    <OrientationContext.Provider value={value}>
      {children}
    </OrientationContext.Provider>
  );
};
