import formatTwoDigitNumber from "../duration-display/formatTwoDigitNumber";
import { NumberButtonValue } from "../number-pad/NumberButton";
import { Durations } from "./types";

export default function changeDuration(
  currentDurations: Partial<Durations>,
  action: NumberButtonValue
): Partial<Durations> {
  let durationString = `${formatTwoDigitNumber(
    currentDurations.hours ?? 0
  )}${formatTwoDigitNumber(
    currentDurations.minutes ?? 0
  )}${formatTwoDigitNumber(currentDurations.seconds ?? 0)}`;

  switch (action.type) {
    case "number": {
      if (currentDurations.hours && currentDurations.hours >= 10) {
        return currentDurations; // We only support up to 99 hours
      }

      durationString = `${durationString}${action.value}`.slice(-6);

      break;
    }
    case "double-zero": {
      if (currentDurations.hours && currentDurations.hours >= 10) {
        return currentDurations; // We only support up to 99 hours
      }

      // Only add 1 zero when we have 5 digits already
      if (
        currentDurations.hours === undefined ||
        currentDurations.hours === 0
      ) {
        durationString = `${durationString}00`.slice(-6);
      } else {
        durationString = `${durationString}0`.slice(-6);
      }

      break;
    }
    case "backspace": {
      durationString = `0${durationString.slice(0, -1)}`.slice(-6);
      break;
    }
    case "clear": {
      durationString = "000000";
      break;
    }
  }

  const newHours = parseInt(durationString.slice(0, 2), 10);
  const newMinutes = parseInt(durationString.slice(2, 4), 10);
  const newSeconds = parseInt(durationString.slice(4, 6), 10);

  return {
    hours: newHours === 0 ? undefined : newHours,
    minutes: newMinutes === 0 ? undefined : newMinutes,
    seconds: newSeconds === 0 ? undefined : newSeconds,
  };
}
