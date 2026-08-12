import { FloatButton } from "antd";
import { useVirtualizer } from "@tanstack/react-virtual";
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
import { VideoCardSkeleton } from "../LoadingSkeletons";

type CardGridProps<T> = {
  items: T[];
  getKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
  height: CSSProperties["height"];
  minItemWidth?: number;
  gap?: number;
  estimateRowHeight?: number;
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  empty?: ReactNode;
  className?: string;
};

export default function CardGrid<T>({
  items,
  getKey,
  renderItem,
  height,
  minItemWidth = 240,
  gap = 16,
  estimateRowHeight = 320,
  hasMore = false,
  isLoading = false,
  isLoadingMore = false,
  onLoadMore,
  empty = "暂无内容",
  className,
}: CardGridProps<T>) {
  const edgePadding = 8;
  const location = useLocation();
  const navigationType = useNavigationType();
  const locationState =
    location.state && typeof location.state === "object"
      ? (location.state as { restoreScroll?: boolean })
      : undefined;
  const shouldRestoreScroll =
    navigationType === "POP" || locationState?.restoreScroll === true;
  const scrollStorageKey = useMemo(
    () => `card-grid-scroll:${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );
  const [scrollElement, setScrollElementState] =
    useState<HTMLDivElement | null>(null);
  const pendingScrollTop = useRef<number | null>(null);
  const [width, setWidth] = useState(0);

  const setScrollElement = useCallback((element: HTMLDivElement | null) => {
    setScrollElementState(element);
    if (element) setWidth(element.getBoundingClientRect().width);
  }, []);

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

  const contentWidth = Math.max(0, width - edgePadding * 2);
  const columns = Math.max(
    1,
    Math.floor((contentWidth + gap) / (minItemWidth + gap)),
  );
  const rowCount = Math.ceil(items.length / columns);
  const virtualizer = useVirtualizer({
    count: rowCount + (hasMore ? 1 : 0),
    getScrollElement: () => scrollElement,
    estimateSize: () => estimateRowHeight + gap,
    getItemKey: (index) => {
      if (index === rowCount) return "loader";
      return `${columns}-${String(getKey(items[index * columns]!))}`;
    },
    overscan: 2,
  });
  const virtualRows = virtualizer.getVirtualItems();

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
  }, [
    columns,
    items.length,
    scrollElement,
    scrollStorageKey,
    shouldRestoreScroll,
  ]);

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
    virtualizer.measure();
  }, [columns, virtualizer]);

  useEffect(() => {
    const lastRow = virtualRows.at(-1);
    if (
      hasMore &&
      !isLoading &&
      !isLoadingMore &&
      onLoadMore &&
      lastRow &&
      lastRow.index >= rowCount - 1
    ) {
      onLoadMore();
    }
  }, [hasMore, isLoading, isLoadingMore, onLoadMore, rowCount, virtualRows]);

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
        style={{
          boxSizing: "border-box",
          height: `calc(100% + ${edgePadding * 2}px)`,
          left: -edgePadding,
          overflowX: "hidden",
          overflowY: "auto",
          padding: edgePadding,
          position: "absolute",
          top: -edgePadding,
          width: `calc(100% + ${edgePadding * 2}px)`,
        }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            position: "relative",
            width: "100%",
          }}
        >
          {virtualRows.map((virtualRow) => {
            const isLoaderRow = virtualRow.index === rowCount;
            const rowItems = items.slice(
              virtualRow.index * columns,
              (virtualRow.index + 1) * columns,
            );
            const loadingItemCount =
              !isLoaderRow && isLoadingMore
                ? Math.max(0, columns - rowItems.length)
                : 0;

            return (
              <div
                key={virtualRow.key}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  boxSizing: "border-box",
                  paddingBottom: gap,
                  position: "absolute",
                  transform: `translateY(${virtualRow.start}px)`,
                  width: "100%",
                }}
              >
                {isLoaderRow ? (
                  <div
                    style={{
                      columnGap: gap,
                      display: "grid",
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: columns }, (_, index) => (
                      <VideoCardSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      columnGap: gap,
                      display: "grid",
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {rowItems.map((item) => (
                      <div key={getKey(item)}>{renderItem(item)}</div>
                    ))}
                    {Array.from({ length: loadingItemCount }, (_, index) => (
                      <VideoCardSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
