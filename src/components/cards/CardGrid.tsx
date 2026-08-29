import { FloatButton } from "antd";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
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
import {
  consumeRestoreNavigationState,
  useRestoreScrollPosition,
} from "../../hooks/useRestoreScrollPosition";
import { VideoCardSkeleton } from "../LoadingSkeletons";
import {
  readVirtuosoState,
  storeVirtuosoState,
} from "../../utils/virtuosoState";

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

const edgePadding = 8;

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
  const location = useLocation();
  const navigationType = useNavigationType();
  const locationState =
    location.state && typeof location.state === "object"
      ? (location.state as { restoreScroll?: boolean })
      : undefined;
  const shouldRestoreScroll = locationState?.restoreScroll === true;
  const shouldRestoreSnapshot =
    shouldRestoreScroll || navigationType === "POP";
  const scrollStorageKey = useMemo(
    () => `card-grid-scroll:${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );
  const [scrollElement, setScrollElementState] =
    useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const loadMoreInFlight = useRef(false);

  const setScrollElement = useCallback(
    (element: HTMLElement | Window | null) => {
      const scrollContainer =
        element instanceof HTMLElement ? element : null;
      setScrollElementState(scrollContainer);
    },
    [],
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => setWidth(container.clientWidth);
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const contentWidth = Math.max(0, width - edgePadding * 2);
  const columns = Math.max(
    1,
    Math.floor((contentWidth + gap) / (minItemWidth + gap)),
  );
  const rowCount = Math.ceil(items.length / columns);
  const totalCount = rowCount + (hasMore ? 1 : 0);
  const gridStyle = useMemo(
    () =>
      ({
        boxSizing: "border-box",
        height: `calc(100% + ${edgePadding * 2}px)`,
        left: -edgePadding,
        minWidth: 0,
        overflowX: "hidden",
        overflowY: "auto",
        position: "absolute",
        top: -edgePadding,
        width: `calc(100% + ${edgePadding * 2}px)`,
      }) as CSSProperties,
    [],
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

  useEffect(() => {
    if (!isLoadingMore) loadMoreInFlight.current = false;
  }, [isLoadingMore]);

  const computeItemKey = useCallback(
    (index: number) => {
      if (index === rowCount) return "loader";

      const item = items[index * columns];
      return item
        ? `${columns}-${String(getKey(item))}`
        : `${columns}-row-${index}`;
    },
    [columns, getKey, items, rowCount],
  );
  const itemContent = useCallback(
    (index: number) => {
      const isLoaderRow = index === rowCount;
      const rowItems = isLoaderRow
        ? []
        : items.slice(index * columns, (index + 1) * columns);
      const loadingItemCount =
        !isLoaderRow && isLoadingMore
          ? Math.max(0, columns - rowItems.length)
          : 0;

      return (
        <div
          style={{
            boxSizing: "border-box",
            paddingBottom: gap,
            paddingInline: edgePadding,
            paddingTop: index === 0 ? edgePadding : 0,
            width: "100%",
          }}
        >
          <div
            style={{
              columnGap: gap,
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {isLoaderRow
              ? Array.from({ length: columns }, (_, skeletonIndex) => (
                  <VideoCardSkeleton key={skeletonIndex} />
                ))
              : rowItems.map((item) => (
                  <div key={getKey(item)}>{renderItem(item)}</div>
                ))}
            {Array.from({ length: loadingItemCount }, (_, skeletonIndex) => (
              <VideoCardSkeleton key={`loading-${skeletonIndex}`} />
            ))}
          </div>
        </div>
      );
    },
    [columns, gap, getKey, isLoadingMore, items, renderItem, rowCount],
  );
  const snapshotLayoutKey = useMemo(
    () =>
      JSON.stringify([
        columns,
        totalCount,
        items.map((item) => String(getKey(item))),
      ]),
    [columns, getKey, items, totalCount],
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
    layoutVersion: `${columns}:${rowCount}:${items.length}`,
    locationKey: `${location.pathname}${location.search}`,
    onLoadMore: requestLoadMore,
    onNavigationStart: captureVirtuosoState,
    onRestoreComplete: consumeRestoreNavigationState,
    scrollElement,
    shouldRestore: shouldRestoreSnapshot && !restoreState,
    storageKey: scrollStorageKey,
  });

  useLayoutEffect(() => {
    if (restoreState) consumeRestoreNavigationState();
  }, [restoreState]);

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
        <Virtuoso
          ref={virtuosoRef}
          className="app-scrollbar"
          computeItemKey={computeItemKey}
          defaultItemHeight={estimateRowHeight + gap}
          endReached={requestLoadMore}
          increaseViewportBy={{ bottom: 600, top: 600 }}
          itemContent={itemContent}
          overscan={200}
          restoreStateFrom={restoreState}
          scrollerRef={setScrollElement}
          style={gridStyle}
          totalCount={totalCount}
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
