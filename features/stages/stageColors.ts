import { Stage } from "@/features/stages/Stage.types";
import { GetThemeValueForKey } from "tamagui";

const stageColors = {
  okay: {
    background: "$green9",
    text: "$white1",
  },
  warning: {
    background: "$yellow9",
    text: "$black1",
  },
  alert: {
    background: "$red9",
    text: "$white1",
  },
} as const satisfies Record<
  Stage,
  {
    background: GetThemeValueForKey<"borderColor">;
    text: GetThemeValueForKey<"color">;
  }
>;

export default stageColors;
