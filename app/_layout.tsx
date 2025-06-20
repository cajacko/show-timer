import Tamagui from "@/context/Tamagui";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { useTheme } from "tamagui";
import { OrientationProvider } from "@/features/orientation/OrientationContext";
import { TimersPersistProvider } from "@/features/timers/TimersPersistContext";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { ViewProps } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function Content({ onLayout }: Pick<ViewProps, "onLayout">) {
  const theme = useTheme();
  const backgroundValue = theme.background.val;

  return (
    <GestureHandlerRootView
      style={React.useMemo(
        () => ({ flex: 1, backgroundColor: backgroundValue }),
        [backgroundValue]
      )}
      onLayout={onLayout}
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" hidden />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const colorScheme = "dark";
  const [hasPersistData, setHasPersistData] = React.useState(false);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  const appIsReady = loaded && hasPersistData;

  const onLayoutRootView = React.useCallback(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  const onReady = React.useCallback(() => {
    setHasPersistData(true);
  }, []);

  return (
    <Tamagui colorScheme={colorScheme}>
      <ThemeProvider value={DarkTheme}>
        <OrientationProvider>
          <TimersPersistProvider onReady={onReady}>
            {appIsReady && <Content onLayout={onLayoutRootView} />}
          </TimersPersistProvider>
        </OrientationProvider>
      </ThemeProvider>
    </Tamagui>
  );
}
