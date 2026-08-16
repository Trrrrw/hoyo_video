import dayjs from "dayjs";

export function getTimelineDateKey(publishTime: string | null): string {
  if (!publishTime) return "unknown";

  const date = dayjs(publishTime);
  return date.isValid() ? date.format("YYYY-MM-DD") : "unknown";
}

export function getTimelineMonthKey(publishTime: string | null): string {
  if (!publishTime) return "unknown";

  const date = dayjs(publishTime);
  return date.isValid() ? date.format("YYYY-MM") : "unknown";
}

export function getTimelineGroupId(dateKey: string): string {
  return `timeline-${dateKey}`;
}

export function getVideoTimelineHref({
  gameId,
  sourceId,
  publishTime,
  from,
}: {
  gameId?: string;
  sourceId?: string;
  publishTime: string | null;
  from?: string;
}): string | undefined {
  if (!gameId || !sourceId) return undefined;

  const listPathname = `/${gameId}/videos`;
  const targetUrl = new URL(
    from ?? listPathname,
    "https://video-timeline.local",
  );

  if (targetUrl.pathname !== listPathname) {
    targetUrl.pathname = listPathname;
    targetUrl.search = "";
  }

  targetUrl.searchParams.set("source", sourceId);
  targetUrl.searchParams.set("view", "timeline");
  targetUrl.hash = `#${getTimelineGroupId(getTimelineDateKey(publishTime))}`;

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
}
