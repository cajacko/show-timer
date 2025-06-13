import { Stage } from "@/features/stages/Stage.types";
import { GetThemeValueForKey } from "tamagui";

const stageColors = {
  okay: "$green9",
  warning: "$yellow9",
  alert: "$red9",
} as const satisfies Record<Stage, GetThemeValueForKey<"borderColor">>;

export default stageColors;
