import { FloatButton, Typography } from "antd";
import { useVirtualizer } from "@tanstack/react-virtual";
import dayjs from "dayjs";
import { useLocation } from "react-router";
import {
  type CSSProperties,
  type Key,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { NewsInfo } from "../../api/types";
import {
  getTimelineDateKey,
  getTimelineGroupId,
  getTimelineMonthKey,
} from "../../libs/videoTimeline";
import {
  consumeRestoreNavigationState,
  useRestoreScrollPosition,
} from "../../hooks/useRestoreScrollPosition";
import { VideoTimelineLoadingSkeleton } from "../LoadingSkeletons";

const { Text } = Typography;

type VideoTimelineProps = {
  items: NewsInfo[];
  getKey: (item: NewsInfo) => Key;
  renderItem: (item: NewsInfo) => ReactNode;
  height: CSSProperties["height"];
  minItemWidth?: number;
  gap?: number;
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  empty?: ReactNode;
  className?: string;
};

type VideoMonthGroup = {
  key: string;
  label: string;
  items: NewsInfo[];
};

type TimelineCardItem = {
  item: NewsInfo;
  anchorId?: string;
};

type VideoTimelineRow =
  | {
      type: "header";
      key: string;
      label: string;
      paddingBottom: number;
    }
  | {
      type: "cards";
      key: string;
      items: TimelineCardItem[];
      paddingBottom: number;
    }
  | {
      type: "loading";
      key: string;
    };

function groupVideosByMonth(items: NewsInfo[]): VideoMonthGroup[] {
  const groups = new Map<string, VideoMonthGroup>();

  for (const item of items) {
    const date = item.publish_time ? dayjs(item.publish_time) : null;
    const key = getTimelineMonthKey(item.publish_time);
    const label = date?.isValid()
      ? date.format("YYYY年MM月")
      : "未知月份";
    const group = groups.get(key);

    if (group) {
      group.items.push(item);
    } else {
      groups.set(key, { key, label, items: [item] });
    }
  }

  return [...groups.values()];
}

function createTimelineRows(
  groups: VideoMonthGroup[],
  columns: number,
  gap: number,
  showLoading: boolean,
) {
  const rows: VideoTimelineRow[] = [];
  const anchorRowIndexes = new Map<string, number>();

  groups.forEach((group, groupIndex) => {
    const isLastGroup = groupIndex === groups.length - 1;
    const groupPaddingBottom = isLastGroup && !showLoading ? 8 : 32;
    const renderedDateKeys = new Set<string>();

    rows.push({
      type: "header",
      key: `${group.key}:header`,
      label: group.label,
      paddingBottom: 12,
    });

    for (let start = 0; start < group.items.length; start += columns) {
      const rowIndex = rows.length;
      const rowItems = group.items.slice(start, start + columns).map((item) => {
        const dateKey = getTimelineDateKey(item.publish_time);
        const isFirstDateItem = !renderedDateKeys.has(dateKey);
        renderedDateKeys.add(dateKey);
        const anchorId = isFirstDateItem
          ? getTimelineGroupId(dateKey)
          : undefined;

        if (anchorId) anchorRowIndexes.set(anchorId, rowIndex);

        return { anchorId, item };
      });
      const isLastRow = start + columns >= group.items.length;

      rows.push({
        type: "cards",
        key: `${group.key}:cards:${start / columns}`,
        items: rowItems,
        paddingBottom: isLastRow ? groupPaddingBottom : gap,
      });
    }
  });

  if (showLoading) rows.push({ type: "loading", key: "loading" });

  return { anchorRowIndexes, rows };
}

function getTimelineScrollKey(pathname: string, search: string) {
  return `video-timeline-scroll:${pathname}${search}`;
}

function getTimelineHashTarget(hash: string): string | null {
  if (!hash.startsWith("#timeline-")) return null;

  let targetId = hash.slice(1);
  try {
    targetId = decodeURIComponent(targetId);
  } catch {
    return null;
  }

  return /^timeline-(?:\d{4}-\d{2}-\d{2}|unknown)$/.test(targetId)
    ? targetId
    : null;
}

export default function VideoTimeline({
  items,
  getKey,
  renderItem,
  height,
  minItemWidth = 340,
  gap = 16,
  hasMore = false,
  isLoading = false,
  isLoadingMore = false,
  onLoadMore,
  empty = "暂无内容",
  className,
}: VideoTimelineProps) {
  const location = useLocation();
  const locationState =
    location.state && typeof location.state === "object"
      ? (location.state as { restoreScroll?: boolean })
      : undefined;
  const shouldRestoreScroll = locationState?.restoreScroll === true;
  const hashTargetId = useMemo(
    () => getTimelineHashTarget(location.hash),
    [location.hash],
  );
  const scrollStorageKey = useMemo(
    () => getTimelineScrollKey(location.pathname, location.search),
    [location.pathname, location.search],
  );
  const [scrollElement, setScrollElementState] =
    useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const scrolledHashTarget = useRef<string | null>(null);
  const loadMoreInFlight = useRef(false);
  const groups = useMemo(() => groupVideosByMonth(items), [items]);
  const setScrollElement = useCallback((element: HTMLDivElement | null) => {
    setScrollElementState(element);
    if (element) setWidth(element.getBoundingClientRect().width);
  }, []);
  const contentWidth = Math.max(0, width - 16 - 32);
  const columns = Math.max(
    1,
    Math.floor((contentWidth + gap) / (minItemWidth + gap)),
  );
  const gridStyle = useMemo<CSSProperties>(
    () => ({
      columnGap: gap,
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      rowGap: gap,
    }),
    [columns, gap],
  );
  const { anchorRowIndexes, rows } = useMemo(
    () =>
      createTimelineRows(
        groups,
        columns,
        gap,
        isLoading || isLoadingMore,
      ),
    [columns, gap, groups, isLoading, isLoadingMore],
  );
  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: (index) => {
      const row = rows[index];
      if (!row) return 320;
      if (row.type === "header") return 36 + row.paddingBottom;
      if (row.type === "loading") return 360;
      return 320 + row.paddingBottom;
    },
    getItemKey: (index) => rows[index]?.key ?? `timeline-row-${index}`,
    getScrollElement: () => scrollElement,
    overscan: 3,
  });
  const virtualRows = virtualizer.getVirtualItems();

  const requestLoadMore = useCallback(() => {
    if (
      !hasMore ||
      isLoading ||
      isLoadingMore ||
      !onLoadMore ||
      loadMoreInFlight.current
    ) {
      return;
    }

    loadMoreInFlight.current = true;
    onLoadMore();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  useRestoreScrollPosition({
    hasMore,
    isLoading,
    isLoadingMore,
    layoutVersion: `${columns}:${items.length}`,
    locationKey: `${location.pathname}${location.search}`,
    onLoadMore: requestLoadMore,
    onRestoreComplete: consumeRestoreNavigationState,
    scrollElement,
    shouldRestore: shouldRestoreScroll,
    storageKey: scrollStorageKey,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [columns, rows.length, virtualizer]);

  const maybeLoadMore = useCallback(() => {
    if (!scrollElement) return;

    const distanceToBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;
    if (distanceToBottom <= 600) requestLoadMore();
  }, [requestLoadMore, scrollElement]);

  useLayoutEffect(() => {
    if (!scrollElement) return;

    const updateWidth = () =>
      setWidth(scrollElement.getBoundingClientRect().width);
    const observer = new ResizeObserver(updateWidth);
    observer.observe(scrollElement);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [scrollElement]);

  useEffect(() => {
    if (!isLoadingMore) loadMoreInFlight.current = false;
  }, [isLoadingMore]);

  const scrollToHashTarget = useCallback(() => {
    if (!hashTargetId || !scrollElement) return false;

    const target = document.getElementById(hashTargetId);
    if (!target) return false;

    const scrollRect = scrollElement.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    scrollElement.scrollTop = Math.max(
      0,
      targetRect.top - scrollRect.top + scrollElement.scrollTop - 8,
    );
    return true;
  }, [hashTargetId, scrollElement]);

  const hashTargetRowIndex = hashTargetId
    ? anchorRowIndexes.get(hashTargetId)
    : undefined;

  useEffect(() => {
    if (!hashTargetId) {
      scrolledHashTarget.current = null;
      return;
    }
    if (
      !scrollElement ||
      scrolledHashTarget.current === hashTargetId
    ) {
      return;
    }

    if (hashTargetRowIndex === undefined) {
      const frame = requestAnimationFrame(requestLoadMore);
      return () => cancelAnimationFrame(frame);
    }

    virtualizer.scrollToIndex(hashTargetRowIndex, { align: "start" });
    let attempts = 0;
    let frame: number;
    const alignHashTarget = () => {
      if (scrollToHashTarget()) {
        scrolledHashTarget.current = hashTargetId;
        return;
      }

      attempts += 1;
      if (attempts < 20) frame = requestAnimationFrame(alignHashTarget);
    };
    frame = requestAnimationFrame(alignHashTarget);

    return () => cancelAnimationFrame(frame);
  }, [
    anchorRowIndexes,
    hashTargetId,
    hashTargetRowIndex,
    hasMore,
    isLoading,
    isLoadingMore,
    items.length,
    requestLoadMore,
    scrollElement,
    scrollToHashTarget,
    virtualizer,
  ]);

  useEffect(() => {
    maybeLoadMore();
  }, [items.length, maybeLoadMore]);

  if (!isLoading && items.length === 0 && !hasMore) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div
      className={className}
      style={{
        boxSizing: "border-box",
        height,
        minWidth: 0,
        position: "relative",
        width: "100%",
      }}
    >
      <div
        ref={setScrollElement}
        className="app-scrollbar"
        onScroll={maybeLoadMore}
        style={{
          boxSizing: "border-box",
          height: "calc(100% + 16px)",
          left: -8,
          overflowX: "hidden",
          overflowY: "auto",
          padding: 8,
          position: "absolute",
          top: -8,
          width: "calc(100% + 16px)",
        }}
      >
        <div
          className="relative pl-8"
          role="region"
          aria-label="视频时间轴"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 bottom-2 left-3 w-0.5"
            style={{ background: "var(--ant-color-border)" }}
          />
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: "relative",
              width: "100%",
            }}
          >
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    boxSizing: "border-box",
                    left: 0,
                    position: "absolute",
                    top: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                    width: "100%",
                  }}
                >
                  {row.type === "header" && (
                    <div
                      className="relative flex min-h-6 items-center"
                      style={{ paddingBottom: row.paddingBottom }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -left-6 top-1.5 size-3 rounded-full border-2"
                        style={{
                          background: "var(--ant-color-primary)",
                          borderColor: "var(--ant-color-bg-container)",
                        }}
                      />
                      <Text strong type="secondary">
                        {row.label}
                      </Text>
                    </div>
                  )}
                  {row.type === "cards" && (
                    <div
                      style={{
                        ...gridStyle,
                        paddingBottom: row.paddingBottom,
                      }}
                    >
                      {row.items.map(({ anchorId, item }) => (
                        <div
                          id={anchorId}
                          key={getKey(item)}
                          className="min-w-0"
                        >
                          {renderItem(item)}
                        </div>
                      ))}
                    </div>
                  )}
                  {row.type === "loading" && (
                    <VideoTimelineLoadingSkeleton columns={columns} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {scrollElement && (
        <FloatButton.BackTop
          target={() => scrollElement}
          visibilityHeight={100}
        />
      )}
    </div>
  );
}
