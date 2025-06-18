import { StageValue } from "@/features/stages/StageButton";
import { NumberButtonValue } from "@/features/number-pad/NumberButton";

export const nullValue: StageValue = [];

export default function getActionValue(
  prevValue: StageValue,
  action: NumberButtonValue,
  type: "time" | "duration"
): StageValue {
  if (action.type === "clear") return nullValue;

  if (action.type === "backspace") {
    if (prevValue.length === 0) return nullValue;

    // remove the first digit from the value
    return prevValue.slice(1);
  }

  if (action.type === "number") {
    if (type === "duration" && prevValue.length === 1 && prevValue[0] === 0) {
      // If the value is 0 and the type is duration, replace it with the new number
      return [action.value];
    }

    const newValue = [action.value, ...prevValue];
    // Limit the value to 6 digits
    return newValue.length > 6 ? newValue.slice(-6) : newValue;
  }

  if (action.type === "double-zero") {
    // Add two zeros to the end of the value
    const newValue = [0, 0, ...prevValue];

    // Keep the back 6 digits of the array
    if (newValue.length > 6) {
      return newValue.slice(-6);
    }

    return newValue;
  }

  return prevValue;
}
