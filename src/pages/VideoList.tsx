import { Button, Collapse, DatePicker, Flex, Segmented } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useGames } from "../api/useGames";
import { useNewsList } from "../api/useNewsList";
import { useSources } from "../api/useSources";
import { useTags } from "../api/useTags";
import AppBreadcrumb from "../components/AppBreadcrumb";
import CardGrid from "../components/cards/CardGrid";
import VideoCard from "../components/cards/VideoCard";
import { FilterOutlined } from "@ant-design/icons";
import { IconRss } from "@tabler/icons-react";
import { useCopyText } from "../hooks/useCopyText";
import { buildNewsRssUrl } from "../libs/getNewsRssUrl";
import { formatDuring, parseDuring } from "../libs/newsFilterParams";
import { VideoListSkeleton } from "../components/LoadingSkeletons";

const { RangePicker } = DatePicker;

function videoListUrl(
  gameId: string,
  sourceId: string,
  tagName?: string,
  during?: string,
  reverse = false,
) {
  const params = new URLSearchParams({ source: sourceId });
  if (tagName) params.set("tag", tagName);
  if (during) params.set("during", during);
  if (reverse) params.set("reverse", "true");

  return `/${gameId}/videos?${params}`;
}

export default function VideoList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const copyWithMessage = useCopyText();

  // game
  const { gameId } = useParams<"gameId">();
  const { games, isLoading: isGamesLoading } = useGames();
  const game = games.find((item) => item.id === gameId);

  // source
  const {
    sources,
    loadedGameId,
    isLoading: isSourcesLoading,
  } = useSources(gameId ?? "");
  const sourcesReady = !isSourcesLoading && loadedGameId === gameId;
  const sortedSources = useMemo(
    () => (sourcesReady ? [...sources].sort((a, b) => a.index - b.index) : []),
    [sources, sourcesReady],
  );
  const sourceId = searchParams.get("source");
  const source = sortedSources.find((item) => item.id === sourceId);

  // tag
  const {
    tags,
    loadedSourceId,
    isLoading: isTagsLoading,
  } = useTags(gameId ?? "", source?.id);
  const tagName = searchParams.get("tag");
  const tag = tags.find((item) => item.name === tagName);
  const newsSourceId =
    source &&
    (!tagName ||
      (Boolean(tag) && !isTagsLoading && loadedSourceId === source.id))
      ? source.id
      : undefined;

  const during = searchParams.get("during") ?? undefined;
  const duringValue = parseDuring(searchParams.get("during"));
  const reverse = searchParams.get("reverse") === "true";

  const {
    news,
    isLoading: isNewsLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useNewsList(gameId ?? "", {
    sourceId: newsSourceId,
    tags: tag ? [tag.name] : undefined,
    newsType: "video",
    during,
    limit: 24,
    reverse,
  });

  function handleFilterChange(nextDuring?: string, nextReverse = false) {
    setSearchParams(
      (current) => {
        if (nextDuring) current.set("during", nextDuring);
        else current.delete("during");

        if (nextReverse) current.set("reverse", "true");
        else current.delete("reverse");

        return current;
      },
      { replace: true },
    );
  }

  function handleCopyRssUrl() {
    if (!game || !source) return;

    const rssUrl = buildNewsRssUrl({
      gameId: game.id,
      sourceId: source.id,
      tags: tag ? [tag.name] : undefined,
      during,
    });
    void copyWithMessage(rssUrl, "RSS 订阅链接已复制");
  }

  useEffect(() => {
    if (isGamesLoading || !sourcesReady || isTagsLoading) {
      return;
    }

    if (!game || !sourceId || !source) {
      void navigate("/404", { replace: true });
      return;
    }

    // 确认当前来源的 tags 已加载完成后，才判断 tag 是否存在。
    if (loadedSourceId === source.id && tagName && !tag) {
      void navigate("/404", { replace: true });
    }
  }, [
    game,
    isGamesLoading,
    isTagsLoading,
    loadedSourceId,
    navigate,
    source,
    sourceId,
    tag,
    tagName,
    sourcesReady,
  ]);

  if (
    isGamesLoading ||
    !sourcesReady ||
    isTagsLoading ||
    !game ||
    !source
  ) {
    return <VideoListSkeleton />;
  }

  return (
    <Flex vertical gap="small" className="min-h-0 min-w-0 flex-1 p-3!">
      <Flex justify="space-between" align="center">
        <AppBreadcrumb
          game={{ id: game.id, name: game.name }}
          source={{
            id: source.id,
            name: source.name,
            to: `/${game.id}?${new URLSearchParams({ source: source.id })}`,
            children: sortedSources.map((item) => ({
              id: item.id,
              name: item.name,
              to: `/${game.id}?${new URLSearchParams({ source: item.id })}`,
            })),
          }}
          tag={{
            id: tag?.name ?? "__all__",
            name: tag?.name ?? "全部视频",
            children: [
              {
                id: "__all__",
                name: "全部视频",
                to: videoListUrl(
                  game.id,
                  source.id,
                  undefined,
                  during,
                  reverse,
                ),
              },
              ...tags.map((item) => ({
                id: item.name,
                name: item.name,
                to: videoListUrl(
                  game.id,
                  source.id,
                  item.name,
                  during,
                  reverse,
                ),
              })),
            ],
          }}
        />
        <Flex gap="small">
          <Button
            type="text"
            icon={<IconRss size={14} />}
            aria-label="复制 RSS 订阅链接"
            onClick={handleCopyRssUrl}
          />
          <Button
            type="text"
            icon={<FilterOutlined />}
            aria-label="显示筛选条件"
            aria-pressed={isFilterVisible}
            onClick={() => setIsFilterVisible((visible) => !visible)}
          />
        </Flex>
      </Flex>

      <Collapse
        ghost
        activeKey={isFilterVisible ? ["filter"] : []}
        items={[
          {
            key: "filter",
            showArrow: false,
            styles: {
              body: {
                padding: "initial",
                paddingBlock: "initial",
                paddingBottom: "8px",
              },
              header: { display: "none" },
            },
            children: (
              <Flex className="w-full" gap="small" align="center">
                <RangePicker
                  allowEmpty={[true, true]}
                  format="YYYY年MM月DD日"
                  value={duringValue}
                  onChange={(dates) => {
                    handleFilterChange(formatDuring(dates), reverse);
                  }}
                />
                <Segmented<string>
                  options={["降序", "升序"]}
                  value={reverse ? "升序" : "降序"}
                  onChange={(value) => {
                    handleFilterChange(during, value === "升序");
                  }}
                />
              </Flex>
            ),
          },
        ]}
      />

      <CardGrid
        items={news}
        getKey={(item) => item.id}
        renderItem={(item) => (
          <VideoCard
            video={item}
            gameId={game.id}
            gameName={game.name}
            sourceId={source.id}
          />
        )}
        className="min-h-0 flex-1"
        height="auto"
        isLoading={isNewsLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        empty={tag ? "该标签暂无视频" : "该来源暂无视频"}
        minItemWidth={340}
      />
    </Flex>
  );
}
