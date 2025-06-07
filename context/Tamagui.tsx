import { defaultConfig } from "@tamagui/config/v4"; // for quick config install this
import React from "react";
import { createTamagui, TamaguiProvider } from "tamagui";

const config = createTamagui(defaultConfig);

export default React.memo(function Tamagui(props: {
  children?: React.ReactNode;
}) {
  return <TamaguiProvider config={config}>{props.children}</TamaguiProvider>;
});
