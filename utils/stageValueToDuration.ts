import { StageValue } from "@/features/stages/StageButton";

/**
 * Convert a stage value into a duration in seconds e.g.
 * [0] = 0
 * [1] = 1 second
 * [2,1] = 12 seconds
 * [4,3,2,1] = 12 minutes and 34 seconds = 754 seconds
 * [6,5,4,3,2,1] = 12 hours, 34 minutes and 56 seconds = 45296 seconds
 */
export default function stageValueToDuration(
  value: StageValue | null
): number | null {
  if (!value || value.length === 0) return null;

  let hour1, hour2, minute1, minute2, second1, second2;

  switch (value.length) {
    case 1:
      hour1 = 0;
      hour2 = 0;
      minute1 = 0;
      minute2 = 0;
      second1 = 0;
      second2 = value[0];
      break;
    case 2:
      hour1 = 0;
      hour2 = 0;
      minute1 = 0;
      minute2 = 0;
      second1 = value[1];
      second2 = value[0];
      break;
    case 3:
      hour1 = 0;
      hour2 = 0;
      minute1 = 0;
      minute2 = value[2];
      second1 = value[1];
      second2 = value[0];
      break;
    case 4:
      hour1 = 0;
      hour2 = 0;
      minute1 = value[3];
      minute2 = value[2];
      second1 = value[1];
      second2 = value[0];
      break;
    case 5:
      hour1 = 0;
      hour2 = value[4];
      minute1 = value[3];
      minute2 = value[2];
      second1 = value[1];
      second2 = value[0];
      break;
    case 6:
      hour1 = value[5];
      hour2 = value[4];
      minute1 = value[3];
      minute2 = value[2];
      second1 = value[1];
      second2 = value[0];
      break;
    default:
      return null;
  }

  const hours = parseInt(`${hour1}${hour2}`, 10);
  const minutes = parseInt(`${minute1}${minute2}`, 10);
  const seconds = parseInt(`${second1}${second2}`, 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds;
}
