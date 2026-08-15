import dayjs from "dayjs";

export function getTimelineDateKey(publishTime: string | null): string {
  if (!publishTime) return "unknown";

  const date = dayjs(publishTime);
  return date.isValid() ? date.format("YYYY-MM-DD") : "unknown";
}

export function getTimelineGroupId(dateKey: string): string {
  return `timeline-${dateKey}`;
}
