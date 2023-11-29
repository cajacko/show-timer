import React, { useCallback, useEffect, useState } from "react";
import { AppState, Dimensions } from "react-native";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Container = styled.Pressable`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: black;
  border-width: 50px;
`;

const Text = styled.Text`
  color: white;
`;

export interface TimerProps {
  children?: React.ReactNode;
}

const formatTime = (totalSeconds: number) => {
  const isNegative = totalSeconds < 0;
  const absoluteSeconds = Math.abs(totalSeconds);

  const hours = Math.floor(absoluteSeconds / 3600);
  const minutes = Math.floor((absoluteSeconds % 3600) / 60);
  const seconds = absoluteSeconds % 60;

  const formattedHours = hours ? `${String(hours).padStart(2, "0")}:` : "";
  const formattedMinutes =
    hours || minutes ? `${String(minutes).padStart(2, "0")}:` : "";
  const formattedSeconds = String(seconds).padStart(2, "0");

  const formattedTime = `${formattedHours}${formattedMinutes}${formattedSeconds}`;
  return isNegative ? `-${formattedTime}` : formattedTime;
};

function useTime() {
  const initialDuration = 20 * 60;

  const [remainingTime, setRemainingTime] = useState(initialDuration);

  const reset = useCallback(async () => {
    const startTime = new Date();

    setRemainingTime(initialDuration);

    await AsyncStorage.setItem("startTime", startTime.toISOString());
  }, [initialDuration]);

  useEffect(() => {
    const initializeTimer = async () => {
      const storedStartTime = await AsyncStorage.getItem("startTime");
      const startTime = storedStartTime
        ? new Date(storedStartTime)
        : new Date();
      const currentTime = new Date();
      const elapsedTime = Math.floor(
        (currentTime.getTime() - startTime.getTime()) / 1000
      );
      setRemainingTime(initialDuration - elapsedTime);

      if (!storedStartTime) {
        await AsyncStorage.setItem("startTime", startTime.toISOString());
      }
    };

    initializeTimer();

    const interval = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [initialDuration]);

  useEffect(() => {
    const appStateListener = async (nextAppState) => {
      // Handle app coming to foreground or going to background
      // Recalculate remaining time
      if (nextAppState === "active") {
        // App has come to the foreground
        const storedStartTime = await AsyncStorage.getItem("startTime");
        if (storedStartTime) {
          const startTime = new Date(storedStartTime);
          const currentTime = new Date();
          const elapsedTime = Math.floor(
            (currentTime.getTime() - startTime.getTime()) / 1000
          );
          setRemainingTime(initialDuration - elapsedTime);
        }
      }
    };

    // Subscribe to app state changes
    const unsubscribe = AppState.addEventListener("change", appStateListener);

    return () => {
      unsubscribe.remove();
    };
  }, []);

  return {
    remainingTime,
    formattedTime: formatTime(remainingTime),
    reset,
  };
}

export default function Timer(props: TimerProps): React.ReactNode {
  const { formattedTime, reset, remainingTime } = useTime();

  const [fontSize, setFontSize] = useState(50); // Default font size
  const [containerWidth, setContainerWidth] = useState(0);

  const updateFontSize = (width) => {
    const calculatedFontSize = width / formattedTime.length; // Simplified calculation
    setFontSize(calculatedFontSize);
  };

  useEffect(() => {
    if (containerWidth) {
      updateFontSize(containerWidth);
    }

    const onChange = () => {
      // Recalculate the font size based on the new dimensions
      updateFontSize(containerWidth);
    };

    const listener = Dimensions.addEventListener("change", onChange);

    return () => {
      listener.remove();
    };
  }, [containerWidth, formattedTime]);

  let borderColor = "green";

  if (remainingTime <= 19 * 60) {
    borderColor = "red";
  } else if (remainingTime <= 19 * 60 + 30) {
    borderColor = "yellow";
  }

  return (
    <Container
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;

        setContainerWidth(width);
      }}
      onPress={reset}
      style={{ borderColor }}
    >
      <Text style={{ fontSize }}>{formattedTime}</Text>
    </Container>
  );
}
