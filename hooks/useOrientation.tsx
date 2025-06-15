import { DeviceMotion } from "expo-sensors";
import { useEffect, useState, useMemo } from "react";
import { Platform } from "react-native";

/**
 * landscapeRight = {"beta": 0.0017308302922174335, "degBeta": 0.09916927079745391, "degGamma": -79.3845566473902, "gamma": -1.3855218887329102}
 * landScapeLeft = {"beta": -0.012769569642841816, "degBeta": -0.7316424467332141, "degGamma": 77.00423572164075, "gamma": 1.343977451324463}
 * portraitUp = {"beta": 1.372117519378662, "degBeta": 78.61654285635728, "degGamma": 7.154967653254619, "gamma": 0.12487774342298508}
 * portraitDown = {"beta": -1.344069480895996, "degBeta": -77.00950862768, "degGamma": 1.35042935764519, "gamma": 0.023569438606500626}
 */
export type Orientation =
  | "portrait-up"
  | "landscape-left"
  | "landscape-right"
  | "portrait-down";

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>("portrait-up");

  useEffect(() => {
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

  return orientation;
}
