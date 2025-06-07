import tamaguiConfig from "@/tamagui.config";
import React from "react";
import { TamaguiProvider } from "tamagui";

export default React.memo(function Tamagui(props: {
  children?: React.ReactNode;
  colorScheme: "light" | "dark";
}) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={props.colorScheme}>
      {props.children}
    </TamaguiProvider>
  );
});
