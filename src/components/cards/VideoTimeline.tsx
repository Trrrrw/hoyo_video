import { FloatButton, Typography } from "antd";
import {
  GroupedVirtuoso,
  type GroupProps,
  type GroupedVirtuosoHandle,
  type ListProps,
  type TopItemListProps,
} from "react-virtuoso";
import dayjs from "dayjs";
import { useLocation, useNavigationType } from "react-router";
import {
  forwardRef,
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
import type { GameVersion, NewsInfo } from "../../api/types";
import {
  getTimelineDateKey,
  getTimelineGroupId,
  getTimelineMonthKey,
} from "../../utils/videoTimeline";
import {
  consumeRestoreNavigationState,
  useRestoreScrollPosition,
} from "../../hooks/useRestoreScrollPosition";
import { VideoCardSkeleton } from "../LoadingSkeletons";
import {
  readVirtuosoState,
  storeVirtuosoState,
} from "../../utils/virtuosoState";

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
  versions?: GameVersion[];
};

type VideoTimeGroup = {
  key: string;
  label: string;
  items: NewsInfo[];
};

type TimelineCardItem = {
  item: NewsInfo;
  anchorId?: string;
};

type TimelineRow = {
  key: string;
  items: TimelineCardItem[];
  isLoading?: boolean;
  paddingBottom: number;
};

type TimelineGroup = VideoTimeGroup & {
  isLoading?: boolean;
  rows: TimelineRow[];
};

type TimelineAnchor = {
  groupIndex: number;
  index: number;
  rowIndex: number;
};

type VersionBoundary = {
  version: GameVersion;
  startTime: number;
};

function getFallbackGroup(
  item: NewsInfo,
): Pick<VideoTimeGroup, "key" | "label"> {
  const date = item.publish_time ? dayjs(item.publish_time) : null;
  const monthKey = getTimelineMonthKey(item.publish_time);
  const monthLabel = date?.isValid() ? date.format("YYYY年MM月") : "未知时间";

  return {
    key: `missing:${monthKey}`,
    label: monthLabel,
  };
}

function getVersionLabel(version: GameVersion): string {
  const id = version.id.trim();
  const name = version.name?.trim();

  if (id && name) return `${id} · ${name}`;
  if (id) return id;
  return name || "未知版本";
}

function findVersionBoundary(
  publishTime: number,
  boundaries: VersionBoundary[],
): VersionBoundary | undefined {
  let low = 0;
  let high = boundaries.length - 1;
  let match: VersionBoundary | undefined;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const boundary = boundaries[middle];

    if (boundary.startTime <= publishTime) {
      match = boundary;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return match;
}

function groupVideosByVersion(
  items: NewsInfo[],
  versions: GameVersion[],
): VideoTimeGroup[] {
  const groups = new Map<string, VideoTimeGroup>();
  const boundaries = versions
    .map((version) => ({
      version,
      startTime: dayjs(version.start_time).valueOf(),
    }))
    .filter((boundary) => Number.isFinite(boundary.startTime))
    .sort((a, b) => a.startTime - b.startTime);

  for (const item of items) {
    const publishTime = item.publish_time
      ? dayjs(item.publish_time).valueOf()
      : Number.NaN;
    const boundary = Number.isFinite(publishTime)
      ? findVersionBoundary(publishTime, boundaries)
      : undefined;
    const { key, label } = boundary
      ? {
          key: `version:${boundary.startTime}:${boundary.version.id}`,
          label: getVersionLabel(boundary.version),
        }
      : getFallbackGroup(item);
    const group = groups.get(key);

    if (group) {
      group.items.push(item);
    } else {
      groups.set(key, { key, label, items: [item] });
    }
  }

  return [...groups.values()];
}

function createTimelineGroups(
  groups: VideoTimeGroup[],
  columns: number,
  gap: number,
  showLoading: boolean,
) {
  const timelineGroups: TimelineGroup[] = [];
  const anchorIndexes = new Map<string, TimelineAnchor>();
  const groupStartIndexes: number[] = [];
  let flatRowIndex = 0;

  groups.forEach((group, groupIndex) => {
    groupStartIndexes.push(flatRowIndex);
    const isLastGroup = groupIndex === groups.length - 1;
    const groupPaddingBottom = isLastGroup && !showLoading ? 8 : 32;
    const renderedDateKeys = new Set<string>();
    const rows: TimelineRow[] = [];

    for (let start = 0; start < group.items.length; start += columns) {
      const rowIndex = rows.length;
      const rowItems = group.items.slice(start, start + columns).map((item) => {
        const dateKey = getTimelineDateKey(item.publish_time);
        const isFirstDateItem = !renderedDateKeys.has(dateKey);
        renderedDateKeys.add(dateKey);
        const anchorId = isFirstDateItem
          ? getTimelineGroupId(dateKey)
          : undefined;

        if (anchorId) {
          anchorIndexes.set(anchorId, {
            groupIndex,
            index: flatRowIndex + rowIndex,
            rowIndex,
          });
        }

        return { anchorId, item };
      });
      const isLastRow = start + columns >= group.items.length;

      rows.push({
        key: `${group.key}:row:${rowIndex}`,
        items: rowItems,
        paddingBottom: isLastRow ? groupPaddingBottom : gap,
      });
    }

    timelineGroups.push({ ...group, rows });
    flatRowIndex += rows.length;
  });

  if (showLoading) {
    groupStartIndexes.push(flatRowIndex);
    timelineGroups.push({
      isLoading: true,
      key: "loading",
      label: "加载中",
      items: [],
      rows: [
        {
          isLoading: true,
          key: "loading:row",
          items: [],
          paddingBottom: 8,
        },
      ],
    });
  }

  return { anchorIndexes, groupStartIndexes, timelineGroups };
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

const TimelineList = forwardRef<HTMLDivElement, ListProps>(
  ({ children, style, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      style={{
        ...style,
        boxSizing: "border-box",
        minWidth: 0,
        paddingLeft: 32,
        position: "relative",
        width: "100%",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-2 bottom-2 left-3 w-0.5"
        style={{ background: "var(--ant-color-border)" }}
      />
      {children}
    </div>
  ),
);

TimelineList.displayName = "TimelineList";

function TimelineGroup({ children, style, ...props }: GroupProps) {
  return (
    <div
      {...props}
      style={{
        ...style,
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}

function TimelineTopItemList({ children, style }: TopItemListProps) {
  return (
    <div
      style={{
        ...style,
        background: "transparent",
      }}
    >
      {children}
    </div>
  );
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
  versions = [],
}: VideoTimelineProps) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const locationState =
    location.state && typeof location.state === "object"
      ? (location.state as { restoreScroll?: boolean })
      : undefined;
  const shouldRestoreScroll = locationState?.restoreScroll === true;
  const shouldRestoreSnapshot =
    shouldRestoreScroll || navigationType === "POP";
  const hashTargetId = useMemo(
    () => getTimelineHashTarget(location.hash),
    [location.hash],
  );
  const scrollStorageKey = useMemo(
    () => getTimelineScrollKey(location.pathname, location.search),
    [location.pathname, location.search],
  );
  const [scrollElement, setScrollElementState] =
    useState<HTMLElement | null>(null);
  const [isTimelineAtTop, setIsTimelineAtTop] = useState(true);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const virtuosoRef = useRef<GroupedVirtuosoHandle | null>(null);
  const scrolledHashTarget = useRef<string | null>(null);
  const loadMoreInFlight = useRef(false);
  const groups = useMemo(
    () => groupVideosByVersion(items, versions),
    [items, versions],
  );
  const setScrollElement = useCallback(
    (element: HTMLElement | null | Window) => {
      const nextElement = element instanceof HTMLElement ? element : null;
      setScrollElementState(nextElement);
      if (nextElement) {
        setIsTimelineAtTop(nextElement.scrollTop <= 0);
      }
    },
    [],
  );
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
  const showLoading =
    isLoading || isLoadingMore || (items.length === 0 && hasMore);
  const { anchorIndexes, groupStartIndexes, timelineGroups } = useMemo(
    () => createTimelineGroups(groups, columns, gap, showLoading),
    [columns, gap, groups, showLoading],
  );
  const groupCounts = useMemo(
    () => timelineGroups.map((group) => group.rows.length),
    [timelineGroups],
  );
  const snapshotLayoutKey = useMemo(
    () =>
      JSON.stringify([
        columns,
        groupCounts,
        items.map((item) => String(getKey(item))),
      ]),
    [columns, getKey, groupCounts, items],
  );
  const restoreState = useMemo(
    () =>
      shouldRestoreSnapshot && width > 0 && !isLoading && !isLoadingMore
        ? readVirtuosoState(scrollStorageKey, snapshotLayoutKey)
        : undefined,
    [
      isLoading,
      isLoadingMore,
      scrollStorageKey,
      shouldRestoreSnapshot,
      snapshotLayoutKey,
      width,
    ],
  );

  const renderGroup = useCallback(
    (groupIndex: number) => {
      const group = timelineGroups[groupIndex];
      if (!group) return null;

      return (
        <div
          className="relative flex min-h-6 items-center"
          role="heading"
          aria-level={2}
          style={{
            background: "transparent",
            paddingBottom: 12,
            zIndex: 2,
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 -left-8 w-8"
            style={{ background: "var(--ant-color-bg-container)" }}
          />
          <span
            aria-hidden="true"
            className="absolute -left-6 top-1.5 size-3 rounded-full border-2"
            style={{
              background: "var(--ant-color-primary)",
              borderColor: "var(--ant-color-bg-container)",
            }}
          />
          <Text strong type="secondary">
            {group.label}
          </Text>
        </div>
      );
    },
    [timelineGroups],
  );

  const renderRow = useCallback(
    (index: number, groupIndex: number) => {
      const group = timelineGroups[groupIndex];
      const rowIndex = index - (groupStartIndexes[groupIndex] ?? 0);
      const row = group?.rows[rowIndex];
      if (!row) return null;

      const rowStyle: CSSProperties = {
        ...gridStyle,
        paddingBottom: row.paddingBottom,
      };

      if (row.isLoading) {
        return (
          <div style={rowStyle}>
            {Array.from({ length: columns }, (_, index) => (
              <VideoCardSkeleton key={index} />
            ))}
          </div>
        );
      }

      return (
        <div style={rowStyle}>
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
      );
    },
    [
      columns,
      getKey,
      gridStyle,
      groupStartIndexes,
      renderItem,
      timelineGroups,
    ],
  );

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

  const captureVirtuosoState = useCallback(() => {
    if (isLoading || isLoadingMore || width <= 0) return;

    virtuosoRef.current?.getState((snapshot) => {
      storeVirtuosoState(scrollStorageKey, snapshotLayoutKey, snapshot);
    });
  }, [
    isLoading,
    isLoadingMore,
    scrollStorageKey,
    snapshotLayoutKey,
    width,
  ]);

  useRestoreScrollPosition({
    hasMore,
    isLoading,
    isLoadingMore,
    layoutVersion: `${columns}:${items.length}`,
    locationKey: `${location.pathname}${location.search}`,
    onLoadMore: requestLoadMore,
    onNavigationStart: captureVirtuosoState,
    onRestoreComplete: consumeRestoreNavigationState,
    scrollElement,
    shouldRestore: shouldRestoreSnapshot && !restoreState,
    storageKey: scrollStorageKey,
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () =>
      setWidth(container.getBoundingClientRect().width);
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  useLayoutEffect(() => {
    if (restoreState) consumeRestoreNavigationState();
  }, [restoreState]);

  useEffect(() => {
    if (!scrollElement) return;

    const updateScrollPosition = () => {
      setIsTimelineAtTop(scrollElement.scrollTop <= 0);
    };

    updateScrollPosition();
    scrollElement.addEventListener("scroll", updateScrollPosition, {
      passive: true,
    });

    return () => {
      scrollElement.removeEventListener("scroll", updateScrollPosition);
    };
  }, [scrollElement]);

  useEffect(() => {
    if (!isLoadingMore) loadMoreInFlight.current = false;
  }, [isLoadingMore]);

  const maybeLoadMore = useCallback(() => {
    if (!scrollElement) return;

    const distanceToBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;
    if (distanceToBottom <= 600) requestLoadMore();
  }, [requestLoadMore, scrollElement]);

  useEffect(() => {
    maybeLoadMore();
  }, [columns, items.length, maybeLoadMore]);

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

  const hashTargetAnchor = hashTargetId
    ? anchorIndexes.get(hashTargetId)
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

    if (!hashTargetAnchor) {
      const frame = requestAnimationFrame(requestLoadMore);
      return () => cancelAnimationFrame(frame);
    }

    let attempts = 0;
    let scrollRequested = false;
    let frame: number;
    const alignHashTarget = () => {
      if (!scrollRequested && virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({
          align: "start",
          index: hashTargetAnchor.index,
        });
        scrollRequested = true;
      }

      if (scrollToHashTarget()) {
        scrolledHashTarget.current = hashTargetId;
        return;
      }

      attempts += 1;
      if (attempts < 60) frame = requestAnimationFrame(alignHashTarget);
    };
    frame = requestAnimationFrame(alignHashTarget);

    return () => cancelAnimationFrame(frame);
  }, [
    anchorIndexes,
    hashTargetAnchor,
    hashTargetId,
    requestLoadMore,
    scrollElement,
    scrollToHashTarget,
  ]);

  if (!isLoading && items.length === 0 && !hasMore) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        boxSizing: "border-box",
        height,
        minWidth: 0,
        position: "relative",
        width: "100%",
      }}
    >
      {width > 0 && (
        <GroupedVirtuoso
          key={columns}
          ref={virtuosoRef}
          aria-label="视频时间轴"
          className={`app-scrollbar timeline-virtuoso${
            isTimelineAtTop ? " timeline-virtuoso-at-top" : ""
          }`}
          components={{
            Group: TimelineGroup,
            List: TimelineList,
            TopItemList: TimelineTopItemList,
          }}
          defaultItemHeight={320}
          endReached={requestLoadMore}
          groupContent={renderGroup}
          groupCounts={groupCounts}
          increaseViewportBy={{ bottom: 600, top: 600 }}
          itemSize={(element, field) => {
            const size =
              field === "offsetHeight"
                ? element.offsetHeight
                : element.offsetWidth;
            if (
              field === "offsetHeight" &&
              element.hasAttribute("data-item-group-index") &&
              size === 0
            ) {
              return 320;
            }
            return size;
          }}
          itemContent={renderRow}
          overscan={200}
          role="region"
          restoreStateFrom={restoreState}
          scrollerRef={setScrollElement}
          style={{
            boxSizing: "border-box",
            height: "100%",
            width: "100%",
          }}
        />
      )}
      {scrollElement && (
        <FloatButton.BackTop
          target={() => scrollElement}
          visibilityHeight={100}
        />
      )}
    </div>
  );
}
