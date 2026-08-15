import { FloatButton, Timeline, Typography } from "antd";
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
import { VideoCardSkeleton } from "../LoadingSkeletons";

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

type VideoGroup = {
  key: string;
  label: string;
  items: NewsInfo[];
};

function groupVideosByDate(items: NewsInfo[]): VideoGroup[] {
  const groups = new Map<string, VideoGroup>();

  for (const item of items) {
    const date = item.publish_time ? dayjs(item.publish_time) : null;
    const key = date?.isValid() ? date.format("YYYY-MM-DD") : "unknown";
    const label = date?.isValid()
      ? date.format("YYYY年MM月DD日")
      : "未知日期";
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
  const scrollStorageKey = useMemo(
    () => getTimelineScrollKey(location.pathname, location.search),
    [location.pathname, location.search],
  );
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const pendingScrollTop = useRef<number | null>(null);
  const groups = useMemo(() => groupVideosByDate(items), [items]);
  const gridStyle = useMemo<CSSProperties>(
    () => ({
      columnGap: gap,
      display: "grid",
      gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}px), 1fr))`,
      rowGap: gap,
    }),
    [gap, minItemWidth],
  );

  const maybeLoadMore = useCallback(() => {
    if (
      !scrollElement ||
      !hasMore ||
      isLoading ||
      isLoadingMore ||
      !onLoadMore
    ) {
      return;
    }

    const distanceToBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;
    if (distanceToBottom <= 600) onLoadMore();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore, scrollElement]);

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
    maybeLoadMore();
  }, [groups.length, maybeLoadMore]);

  if (!isLoading && items.length === 0 && !hasMore) {
    return <div className={className}>{empty}</div>;
  }

  const timelineItems = [
    ...groups.map((group) => ({
      title: <Text type="secondary">{group.label}</Text>,
      content: (
        <div style={gridStyle}>
          {group.items.map((item) => (
            <div key={getKey(item)}>{renderItem(item)}</div>
          ))}
        </div>
      ),
    })),
    ...(isLoading || isLoadingMore
      ? [
          {
            title: <Text type="secondary">加载中</Text>,
            content: (
              <div style={gridStyle}>
                {Array.from({ length: 3 }, (_, index) => (
                  <VideoCardSkeleton key={index} />
                ))}
              </div>
            ),
          },
        ]
      : []),
  ];

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
        <Timeline mode="start" titleSpan={4} items={timelineItems} />
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
