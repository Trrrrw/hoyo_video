import { Empty, Flex, Typography } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router";
import type { RelatedVideoInfo } from "../api/types";
import { formatDuration } from "../libs/formatDuration";

const { Text, Title } = Typography;

type RelatedVideosProps = {
  videos: RelatedVideoInfo[];
  gameId: string;
  from?: string;
};

export default function RelatedVideos({
  videos,
  gameId,
  from,
}: RelatedVideosProps) {
  return (
    <section aria-labelledby="related-videos-title" className="h-fit min-w-0">
      <Title id="related-videos-title" level={3} className="mb-3! mt-0!">
        相关推荐
      </Title>

      {videos.length === 0 ? (
        <div className="py-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无相关推荐"
          />
        </div>
      ) : (
        <Flex vertical gap={4}>
          {videos.map((video) => {
            const publishDate = video.publish_time
              ? dayjs(video.publish_time).format("YYYY-MM-DD")
              : "未知日期";
            const primaryTag = video.tags.at(0);

            return (
              <Link
                key={`${video.source_id}-${video.id}`}
                to={`/${gameId}/videos/${video.source_id}/${video.id}`}
                state={from ? { from } : undefined}
                className="group flex min-w-0 gap-3 rounded-lg p-2 text-inherit! transition-colors hover:bg-black/5 focus-visible:bg-black/5 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
              >
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-black/6 sm:w-36 2xl:w-40 dark:bg-white/10">
                  {video.cover ? (
                    <img
                      src={video.cover}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover group-hover:brightness-90 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
                    />
                  ) : null}

                  {video.video_duration !== null && (
                    <span className="absolute right-1 bottom-1 rounded bg-black/75 px-1.5 py-0.5 text-[11px] leading-none font-medium text-white shadow-sm">
                      {formatDuration(video.video_duration)}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col py-0.5">
                  <Text
                    strong
                    className="line-clamp-2! text-sm! leading-5! transition-colors group-hover:text-blue-500!"
                  >
                    {video.title}
                  </Text>
                  <Text
                    type="secondary"
                    className="mt-auto line-clamp-1! text-xs! leading-5!"
                  >
                    {primaryTag ? `${primaryTag} · ${publishDate}` : publishDate}
                  </Text>
                </div>
              </Link>
            );
          })}
        </Flex>
      )}
    </section>
  );
}
