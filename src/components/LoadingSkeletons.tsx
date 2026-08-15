import { Card, Flex, Skeleton, Typography } from "antd";
import type { ReactNode } from "react";
import { useCallback, useLayoutEffect, useState } from "react";

const { Text } = Typography;
const scrollbarGutter = 8;

type GridSkeletonProps = {
  count?: number;
  minItemWidth?: number;
  className?: string;
};

function MediaSkeleton({ rounded = true }: { rounded?: boolean }) {
  return (
    <div
      className={`aspect-video w-full overflow-hidden ${rounded ? "rounded-xl" : ""}`}
    >
      <Skeleton.Image
        active
        className="h-full! w-full!"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <Flex vertical gap="small" aria-hidden="true">
      <MediaSkeleton />
      <Skeleton
        active
        title={{ width: "88%" }}
        paragraph={{ rows: 1, width: "42%" }}
      />
    </Flex>
  );
}

export function TagCardSkeleton() {
  return (
    <Card
      aria-hidden="true"
      cover={<MediaSkeleton rounded={false} />}
      styles={{ body: { padding: 16, textAlign: "center" } }}
    >
      <Skeleton.Input active size="small" style={{ width: "45%" }} />
    </Card>
  );
}

function SkeletonGrid({
  count = 8,
  minItemWidth = 340,
  className,
  renderItem,
}: GridSkeletonProps & { renderItem: () => ReactNode }) {
  return (
    <div
      className={className}
      style={{
        boxSizing: "border-box",
        display: "grid",
        gap: 16,
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}px), 1fr))`,
        paddingRight: scrollbarGutter,
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>{renderItem()}</div>
      ))}
    </div>
  );
}

export function VideoGridSkeleton(props: GridSkeletonProps) {
  return <SkeletonGrid {...props} renderItem={() => <VideoCardSkeleton />} />;
}

export function VideoTimelineLoadingSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <section className="relative pb-2">
      <div className="relative mb-3 flex min-h-6 items-center">
        <span
          aria-hidden="true"
          className="absolute -left-6 top-1.5 size-3 rounded-full border-2"
          style={{
            background: "var(--ant-color-fill-secondary)",
            borderColor: "var(--ant-color-bg-container)",
          }}
        />
        <Text type="secondary">加载中</Text>
      </div>
      <div
        style={{
          columnGap: 16,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          rowGap: 16,
        }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

function VideoTimelineSkeleton() {
  const [scrollElement, setScrollElementState] =
    useState<HTMLDivElement | null>(null);
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
    updateWidth();

    return () => observer.disconnect();
  }, [scrollElement]);
  const contentWidth = Math.max(0, width - 16 - 32);
  const columns = Math.max(
    1,
    Math.floor((contentWidth + 16) / (340 + 16)),
  );

  return (
    <div
      ref={setScrollElement}
      className="app-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto"
      aria-hidden="true"
    >
      <div className="relative pl-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-2 bottom-2 left-3 w-0.5"
          style={{ background: "var(--ant-color-border)" }}
        />
        <VideoTimelineLoadingSkeleton columns={columns} />
      </div>
    </div>
  );
}

export function TagGridSkeleton(props: GridSkeletonProps) {
  return <SkeletonGrid {...props} renderItem={() => <TagCardSkeleton />} />;
}

function HeaderSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <Flex
      justify="space-between"
      align="center"
      aria-hidden="true"
      style={{ minHeight: 32 }}
    >
      <Skeleton.Input active size="small" style={{ width: 240 }} />
      <Flex gap="small">
        {Array.from({ length: actions }, (_, index) => (
          <Skeleton.Button key={index} active shape="circle" size="small" />
        ))}
      </Flex>
    </Flex>
  );
}

export function VideoListSkeleton({ timeline = false }: { timeline?: boolean }) {
  return (
    <Flex
      vertical
      gap="small"
      className="min-h-0 min-w-0 flex-1 overflow-hidden p-3!"
    >
      <HeaderSkeleton />
      <div aria-hidden="true" />
      {timeline ? <VideoTimelineSkeleton /> : <VideoGridSkeleton count={8} />}
    </Flex>
  );
}

export function TagListSkeleton() {
  return (
    <Flex
      vertical
      gap="middle"
      className="min-h-0 min-w-0 flex-1 overflow-hidden p-3!"
    >
      <HeaderSkeleton actions={1} />
      <TagGridSkeleton count={8} minItemWidth={300} />
    </Flex>
  );
}

export function SearchSkeleton() {
  return (
    <Flex
      vertical
      gap="small"
      className="min-h-0 min-w-0 flex-1 overflow-hidden p-3!"
      aria-hidden="true"
    >
      <Flex justify="space-between" align="center">
        <Skeleton.Input active style={{ width: 128 }} />
        <Flex gap="small">
          <Skeleton.Button active shape="circle" size="small" />
          <Skeleton.Button active shape="circle" size="small" />
        </Flex>
      </Flex>
      <Flex gap="small">
        <Skeleton.Button active style={{ width: 52 }} />
        <Skeleton.Input active style={{ width: 128 }} />
        <Skeleton.Input active block />
      </Flex>
      <VideoGridSkeleton count={8} />
    </Flex>
  );
}

export function VideoDetailSkeleton() {
  return (
    <Flex
      vertical
      gap="middle"
      className="app-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto p-3!"
      aria-hidden="true"
    >
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_21.875rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Flex vertical gap="middle" className="min-w-0">
          <Card
            className="overflow-hidden!"
            styles={{ body: { padding: 0 } }}
          >
            <MediaSkeleton rounded={false} />
          </Card>
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </Flex>
        <Flex vertical gap={4} className="h-fit">
          <Skeleton.Input active size="small" style={{ width: 96 }} />
          {Array.from({ length: 4 }, (_, index) => (
            <Flex key={index} gap="small" className="rounded-lg p-2">
              <div className="w-32 shrink-0 sm:w-36 2xl:w-40">
                <MediaSkeleton />
              </div>
              <Flex vertical gap="small" className="min-w-0 flex-1">
                <Skeleton.Input active block size="small" />
                <Skeleton.Input active size="small" style={{ width: 72 }} />
              </Flex>
            </Flex>
          ))}
        </Flex>
      </div>
    </Flex>
  );
}
