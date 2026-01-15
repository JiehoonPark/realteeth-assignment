import type { HourlyTemperature } from "../model/types";

const MINUTES_PER_DAY = 24 * 60;

type CurrentSlotParams = {
  hourly: HourlyTemperature[];
  recordedAt: string;
};

function getMinutesOfDayFromDate(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getMinutesOfDayFromLabel(label: string) {
  const [hourPart, minutePart = "0"] = label.split(":");
  return Number(hourPart) * 60 + Number(minutePart);
}

function getCircularMinutesDiff(first: number, second: number) {
  const diff = Math.abs(first - second);
  return Math.min(diff, MINUTES_PER_DAY - diff);
}

function getForwardMinutesDiff(current: number, target: number) {
  return (target - current + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function getCurrentHourlySlotIndex({
  hourly,
  recordedAt,
}: CurrentSlotParams) {
  if (hourly.length === 0) return -1;

  const currentMinutes = getMinutesOfDayFromDate(new Date(recordedAt));

  return hourly.reduce((bestIndex, item, index) => {
    const bestMinutes = getMinutesOfDayFromLabel(hourly[bestIndex].hour);
    const currentDiff = getCircularMinutesDiff(
      currentMinutes,
      getMinutesOfDayFromLabel(item.hour),
    );
    const bestDiff = getCircularMinutesDiff(currentMinutes, bestMinutes);
    if (currentDiff < bestDiff) return index;
    if (currentDiff > bestDiff) return bestIndex;

    const currentForward = getForwardMinutesDiff(
      currentMinutes,
      getMinutesOfDayFromLabel(item.hour),
    );
    const bestForward = getForwardMinutesDiff(currentMinutes, bestMinutes);
    return currentForward < bestForward ? index : bestIndex;
  }, 0);
}
