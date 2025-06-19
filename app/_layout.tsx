import Tamagui from "@/context/Tamagui";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { useTheme } from "tamagui";
import { OrientationProvider } from "@/features/orientation/OrientationContext";

function Content() {
  const theme = useTheme();
  const backgroundValue = theme.background.val;

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: backgroundValue }}
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

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Tamagui colorScheme={colorScheme}>
      <ThemeProvider value={DarkTheme}>
        <OrientationProvider>
          <Content />
        </OrientationProvider>
      </ThemeProvider>
    </Tamagui>
  );
}
