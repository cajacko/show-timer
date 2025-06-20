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

      const beta = (rotation.beta * 180) / Math.PI; // x-axis (front/back tilt)
      const gamma = (rotation.gamma * 180) / Math.PI; // y-axis (sideways tilt)

      let newOrientation: Orientation = "portrait-up";

      if (Math.abs(beta) < 45 && gamma > 45) {
        newOrientation = "landscape-left";
      } else if (Math.abs(beta) < 45 && gamma < -45) {
        newOrientation = "landscape-right";
      } else if (beta > 45) {
        newOrientation = "portrait-up";
      } else if (beta < -45) {
        newOrientation = "portrait-down";
      }

      setOrientation((prev) =>
        prev === newOrientation ? prev : newOrientation
      );
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
