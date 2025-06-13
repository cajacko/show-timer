import { StageValue } from "@/features/stages/StageButton";
import { NumberButtonValue } from "@/features/number-pad/NumberButton";

export const nullValue: StageValue = [];

export default function getActionValue(
  prevValue: StageValue,
  action: NumberButtonValue
): StageValue {
  if (action.type === "clear") return nullValue;

  if (action.type === "backspace") {
    if (prevValue.length === 0) return nullValue;

    return prevValue.slice(0, -1);
  }

  if (action.type === "number") {
    const newValue = [action.value, ...prevValue];
    // Limit the value to 6 digits
    return newValue.length > 6 ? newValue.slice(0, 6) : newValue;
  }

  if (action.type === "double-zero") {
    // Add two zeros to the end of the value
    const newValue = [0, 0, ...prevValue];
    // Limit the value to 6 digits
    return newValue.length > 6 ? newValue.slice(0, 6) : newValue;
  }

  return prevValue;
}
