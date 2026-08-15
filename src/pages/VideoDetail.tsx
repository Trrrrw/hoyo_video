import { Card, Flex, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import type { NewsInfo } from "../api/types";
import RelatedVideos from "../components/RelatedVideos";
import VideoPlayer from "../components/VideoPlayer";
import { useNewsDetail } from "../api/useNewsDetail";
import { useSources } from "../api/useSources";
import { VideoDetailSkeleton } from "../components/LoadingSkeletons";
import { useGames } from "../api/useGames";
import { cleanHtmlText } from "../libs/cleanHtmlText";
import { getVideoTimelineHref } from "../libs/videoTimeline";

const { Paragraph, Text, Title } = Typography;

type VideoDetailLocationState = {
  from?: string;
};

export default function VideoDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from } = (location.state ?? {}) as VideoDetailLocationState;

  const { gameId, sourceId, videoId } = useParams<{
    gameId: string;
    sourceId: string;
    videoId: string;
  }>();

  const { sources } = useSources(gameId ?? "");
  const { games } = useGames();
  const { news, isLoading } = useNewsDetail(gameId, videoId, sourceId);
  const gameName =
    games.find((game) => game.id === gameId)?.name ?? gameId ?? "未知游戏";
  const sourceName =
    sources.find((source) => source.id === sourceId)?.name ??
    sourceId ??
    "未知来源";

  useEffect(() => {
    if (!isLoading && !news) {
      void navigate("/404", { replace: true });
    }
  }, [news, isLoading, navigate]);

  if (isLoading || !news) {
    return <VideoDetailSkeleton />;
  }

  const handleBack = () => {
    if (from) {
      void navigate(from, { state: { restoreScroll: true } });
      return;
    }

    void navigate({
      pathname: `/${gameId}`,
      search: new URLSearchParams({
        source: sourceId ?? "",
      }).toString(),
    });
  };

  return (
    <Flex
      vertical
      gap="middle"
      className="app-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto p-3!"
    >
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_21.875rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Flex vertical gap="middle" className="min-w-0">
          <Card
            className="overflow-hidden! bg-black!"
            styles={{ body: { padding: 0 } }}
          >
            <VideoPlayer
              news={news}
              gameId={gameId ?? ""}
              gameName={gameName}
              onBack={handleBack}
            />
          </Card>
          <VideoInfo
            gameId={gameId}
            news={news}
            sourceId={sourceId}
            sourceName={sourceName}
            timelineHref={getVideoTimelineHref({
              gameId,
              sourceId,
              publishTime: news.publish_time,
              from,
            })}
          />
        </Flex>
        <RelatedVideos
          videos={news.related_videos}
          gameId={gameId ?? ""}
          from={from}
        />
      </div>
    </Flex>
  );
}

function VideoInfo({
  gameId,
  news,
  sourceId,
  sourceName,
  timelineHref,
}: {
  gameId?: string;
  news: NewsInfo;
  sourceId?: string;
  sourceName: string;
  timelineHref?: string;
}) {
  const intro = cleanHtmlText(news.intro);

  return (
    <Card>
      <Flex vertical gap="middle">
        <Title level={2} className="mb-0! mt-0!">
          {news.title}
        </Title>
        <Flex wrap align="center" gap="small">
          <Text type="secondary">来源：{sourceName}</Text>
          {timelineHref ? (
            <Link to={timelineHref} className="text-inherit!">
              <Text type="secondary">
                {news.publish_time
                  ? dayjs(news.publish_time).format("YYYY年MM月DD日 HH:mm")
                  : "未知时间"}
              </Text>
            </Link>
          ) : (
            <Text type="secondary">
              {news.publish_time
                ? dayjs(news.publish_time).format("YYYY年MM月DD日 HH:mm")
                : "未知时间"}
            </Text>
          )}
          {news.tags.map((tag) => {
            const tagLink =
              gameId && sourceId
                ? `/${gameId}/videos?${new URLSearchParams({
                    source: sourceId,
                    tag,
                  }).toString()}`
                : undefined;

            return tagLink ? (
              <Link key={tag} to={tagLink} className="no-underline!">
                <Tag className="cursor-pointer">{tag}</Tag>
              </Link>
            ) : (
              <Tag key={tag}>{tag}</Tag>
            );
          })}
        </Flex>
        <Paragraph className="mb-0! whitespace-pre-wrap">
          {intro || "暂无简介"}
        </Paragraph>
      </Flex>
    </Card>
  );
}
