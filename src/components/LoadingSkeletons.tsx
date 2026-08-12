import { Card, Flex, Skeleton } from "antd";
import type { ReactNode } from "react";

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
        display: "grid",
        gap: 16,
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minItemWidth}px), 1fr))`,
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

export function TagGridSkeleton(props: GridSkeletonProps) {
  return <SkeletonGrid {...props} renderItem={() => <TagCardSkeleton />} />;
}

function HeaderSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <Flex justify="space-between" align="center" aria-hidden="true">
      <Skeleton.Input active size="small" style={{ width: 240 }} />
      <Flex gap="small">
        {Array.from({ length: actions }, (_, index) => (
          <Skeleton.Button key={index} active shape="circle" size="small" />
        ))}
      </Flex>
    </Flex>
  );
}

export function VideoListSkeleton() {
  return (
    <Flex
      vertical
      gap="small"
      className="min-h-0 min-w-0 flex-1 overflow-hidden p-3!"
    >
      <HeaderSkeleton />
      <VideoGridSkeleton count={8} />
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
