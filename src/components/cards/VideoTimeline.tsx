import { FloatButton, Typography } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigationType } from "react-router";
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
  const navigationType = useNavigationType();
  const locationState =
    location.state && typeof location.state === "object"
      ? (location.state as { restoreScroll?: boolean })
      : undefined;
  const shouldRestoreScroll =
    navigationType === "POP" || locationState?.restoreScroll === true;
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
  const pendingScrollTop = useRef<number | null>(null);
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

  useLayoutEffect(() => {
    pendingScrollTop.current = null;

    if (!scrollElement || !shouldRestoreScroll) return;

    const savedScrollTop = Number(
      sessionStorage.getItem(scrollStorageKey) ?? "0",
    );
    if (!Number.isFinite(savedScrollTop) || savedScrollTop <= 0) return;

    pendingScrollTop.current = savedScrollTop;

    const restoreScrollPosition = () => {
      const targetScrollTop = pendingScrollTop.current;
      if (targetScrollTop === null) return;

      const maxScrollTop = Math.max(
        0,
        scrollElement.scrollHeight - scrollElement.clientHeight,
      );
      scrollElement.scrollTop = Math.min(targetScrollTop, maxScrollTop);

      if (maxScrollTop >= targetScrollTop) {
        pendingScrollTop.current = null;
      }
    };

    restoreScrollPosition();
    const frame = requestAnimationFrame(restoreScrollPosition);

    return () => cancelAnimationFrame(frame);
  }, [items.length, scrollElement, scrollStorageKey, shouldRestoreScroll]);

  useEffect(() => {
    if (!scrollElement) return;

    const saveScrollPosition = () => {
      const targetScrollTop = pendingScrollTop.current;
      if (
        targetScrollTop !== null &&
        scrollElement.scrollTop < targetScrollTop
      ) {
        return;
      }

      sessionStorage.setItem(
        scrollStorageKey,
        String(Math.round(scrollElement.scrollTop)),
      );
    };

    scrollElement.addEventListener("scroll", saveScrollPosition, {
      passive: true,
    });

    return () => {
      scrollElement.removeEventListener("scroll", saveScrollPosition);
    };
  }, [scrollElement, scrollStorageKey]);

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

    const frame = requestAnimationFrame(() => {
      if (scrollToHashTarget()) {
        scrolledHashTarget.current = hashTargetId;
        return;
      }

      requestLoadMore();
    });

    return () => cancelAnimationFrame(frame);
  }, [
    hashTargetId,
    hasMore,
    isLoading,
    isLoadingMore,
    items.length,
    requestLoadMore,
    scrollElement,
    scrollToHashTarget,
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
        <div className="relative pl-8" aria-label="视频时间轴">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-2 bottom-2 left-3 w-0.5"
            style={{ background: "var(--ant-color-border)" }}
          />
          {groups.map((group) => {
            const renderedDateKeys = new Set<string>();

            return (
              <section key={group.key} className="relative pb-8 last:pb-2">
                <div className="relative mb-3 flex min-h-6 items-center">
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
                <div style={gridStyle}>
                  {group.items.map((item) => {
                    const dateKey = getTimelineDateKey(item.publish_time);
                    const isFirstDateItem = !renderedDateKeys.has(dateKey);
                    renderedDateKeys.add(dateKey);

                    return (
                      <div
                        id={
                          isFirstDateItem
                            ? getTimelineGroupId(dateKey)
                            : undefined
                        }
                        key={getKey(item)}
                        className="min-w-0"
                      >
                        {renderItem(item)}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {(isLoading || isLoadingMore) && (
            <VideoTimelineLoadingSkeleton columns={columns} />
          )}
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
