import Tamagui from "@/context/Tamagui";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Text, View, useTheme } from "tamagui";
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

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const onReady = React.useCallback(() => {
    setHasPersistData(true);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <Tamagui colorScheme={colorScheme}>
      <ThemeProvider value={DarkTheme}>
        <OrientationProvider>
          <TimersPersistProvider onReady={onReady}>
            {hasPersistData ? (
              <Content />
            ) : (
              <View flex={1} items="center" justify="center">
                <Text color="$color">Loading...</Text>
              </View>
            )}
          </TimersPersistProvider>
        </OrientationProvider>
      </ThemeProvider>
    </Tamagui>
  );
}
