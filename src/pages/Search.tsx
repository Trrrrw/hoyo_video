import {
  Button,
  Collapse,
  DatePicker,
  Flex,
  Input,
  Segmented,
  Select,
  Typography,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { IconRss } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { backendUrl } from "../api/client";
import { useCopyText } from "../hooks/useCopyText";
import { useGames } from "../api/useGames";
import { useNewsList } from "../api/useNewsList";
import { useSources } from "../api/useSources";
import { useTags } from "../api/useTags";
import CardGrid from "../components/cards/CardGrid";
import VideoCard from "../components/cards/VideoCard";
import EmptyMark from "../assets/home-mark/home-mark-1.avif";
import { buildNewsRssUrl } from "../libs/getNewsRssUrl";
import { formatDuring, parseDuring } from "../libs/newsFilterParams";
import { SearchSkeleton } from "../components/LoadingSkeletons";
import PageTitle from "../components/PageTitle";

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const copyWithMessage = useCopyText();
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const gameId = searchParams.get("game");
  const query = searchParams.get("q")?.trim() ?? "";
  const sourceId = searchParams.get("source");
  const selectedTags = searchParams.getAll("tag");
  const during = searchParams.get("during") ?? undefined;
  const duringValue = parseDuring(searchParams.get("during"));
  const reverse = searchParams.get("reverse") === "true";
  const [searchValue, setSearchValue] = useState(query);

  const { games, isLoading: isGamesLoading } = useGames();
  const game = games.find((item) => item.id === gameId);

  const {
    sources,
    loadedGameId,
    isLoading: isSourcesLoading,
  } = useSources(gameId ?? "");
  const sourcesReady = !isSourcesLoading && loadedGameId === gameId;
  const sortedSources = useMemo(
    () =>
      sourcesReady ? [...sources].sort((a, b) => a.index - b.index) : [],
    [sources, sourcesReady],
  );
  const source = sortedSources.find((item) => item.id === sourceId);
  const { tags, isLoading: isTagsLoading } = useTags(
    gameId ?? "",
    source?.id,
  );

  useEffect(() => {
    if (!isGamesLoading && (!gameId || !game)) {
      void navigate("/404", { replace: true });
    }
  }, [game, gameId, isGamesLoading, navigate]);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    if (!sourcesReady) return;

    if (!sourceId && sortedSources[0]) {
      setSearchParams(
        (current) => {
          current.set("source", sortedSources[0]!.id);
          return current;
        },
        { replace: true },
      );
      return;
    }

    if (sourceId && !source) {
      void navigate("/404", { replace: true });
    }
  }, [
    navigate,
    setSearchParams,
    sortedSources,
    source,
    sourceId,
    sourcesReady,
  ]);

  const {
    news,
    page,
    isLoading: isNewsLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  } = useNewsList(gameId ?? "", {
    sourceId: query && source ? source.id : undefined,
    q: query || undefined,
    newsType: "video",
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    during,
    limit: 24,
    reverse,
  });
  const pageTitle = query ? `搜索「${query}」` : "搜索";

  const handleSearch = (value: string) => {
    const nextQuery = value.trim();
    setSearchParams((current) => {
      if (gameId) current.set("game", gameId);
      if (nextQuery) current.set("q", nextQuery);
      else current.delete("q");
      if (sourceId) current.set("source", sourceId);
      else current.delete("source");
      return current;
    });
  };

  const handleSourceChange = (nextSourceId: string) => {
    setSearchParams(
      (current) => {
        current.set("source", nextSourceId);
        current.delete("tag");
        return current;
      },
      { replace: true },
    );
  };

  const handleGameChange = (nextGameId: string) => {
    setSearchParams((current) => {
      current.set("game", nextGameId);
      if (query) current.set("q", query);
      else current.delete("q");
      current.delete("source");
      current.delete("tag");
      return current;
    });
  };

  const handleDuringChange = (dates: Parameters<NonNullable<React.ComponentProps<typeof RangePicker>["onChange"]>>[0]) => {
    const nextDuring = formatDuring(dates);
    setSearchParams(
      (current) => {
        if (nextDuring) current.set("during", nextDuring);
        else current.delete("during");
        return current;
      },
      { replace: true },
    );
  };

  const handleTagsChange = (nextTags: string[]) => {
    setSearchParams(
      (current) => {
        current.delete("tag");
        nextTags.forEach((tag) => current.append("tag", tag));
        return current;
      },
      { replace: true },
    );
  };

  const handleReverseChange = (value: string) => {
    setSearchParams(
      (current) => {
        if (value === "升序") current.set("reverse", "true");
        else current.delete("reverse");
        return current;
      },
      { replace: true },
    );
  };

  const handleCopyRssUrl = () => {
    if (!game || !source) return;

    const rssUrl = buildNewsRssUrl({
      gameId: game.id,
      sourceId: source.id,
      q: query,
      tags: selectedTags,
      during,
    });

    void copyWithMessage(rssUrl, "RSS 订阅链接已复制");
  };

  if (
    isGamesLoading ||
    isSourcesLoading ||
    !game ||
    !sourcesReady ||
    !source
  ) {
    return (
      <>
        <PageTitle title={pageTitle} />
        <SearchSkeleton />
      </>
    );
  }

  const emptyState = (
    <Flex vertical align="center" justify="center" gap="small" className="h-full py-8">
      <img
        src={EmptyMark}
        alt=""
        className="h-28 w-auto object-contain"
        draggable={false}
      />
      <Text type="secondary">
        {query ? "没有找到匹配的视频" : "请输入关键词开始搜索"}
      </Text>
    </Flex>
  );

  return (
    <>
      <PageTitle title={pageTitle} />
      <Flex vertical gap="small" className="min-h-0 min-w-0 flex-1 p-3!">
      <Flex vertical gap="small">
        <Flex align="center" justify="space-between" gap="small">
          <Title level={1} className="mb-0! mt-0! text-xl!">
            搜索视频
          </Title>
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
              aria-label="显示更多筛选条件"
              aria-pressed={isFilterVisible}
              onClick={() => setIsFilterVisible((visible) => !visible)}
            />
          </Flex>
        </Flex>

        <Flex wrap gap="small" align="center">
          <Select
            suffixIcon={null}
            className="w-13!"
            value={game.id}
            options={games.map((item) => ({
              label: item.icon ? (
                <img
                  src={backendUrl(item.icon)}
                  alt={item.name}
                  className="size-5 rounded object-cover"
                  draggable={false}
                />
              ) : (
                <span aria-label={item.name}>{item.name.slice(0, 1)}</span>
              ),
              value: item.id,
            }))}
            onChange={handleGameChange}
            aria-label="选择游戏"
          />
          <Select
            className="min-w-32"
            value={source.id}
            options={sortedSources.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            onChange={handleSourceChange}
            aria-label="选择来源"
          />
          <Input.Search
            className="min-w-60 flex-1!"
            value={searchValue}
            enterButton
            allowClear
            placeholder={`在${game.name}中搜索视频`}
            onChange={(event) => setSearchValue(event.target.value)}
            onSearch={handleSearch}
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
              <Flex wrap gap="small" align="center">
                <Select
                  mode="multiple"
                  allowClear
                  className="min-w-52"
                  placeholder="筛选标签"
                  loading={isTagsLoading}
                  value={selectedTags}
                  options={tags.map((tag) => ({
                    label: tag.name,
                    value: tag.name,
                  }))}
                  maxTagCount="responsive"
                  onChange={handleTagsChange}
                  aria-label="筛选标签"
                />
                <RangePicker
                  allowEmpty={[true, true]}
                  format="YYYY年MM月DD日"
                  value={duringValue}
                  onChange={handleDuringChange}
                />
                <Segmented<string>
                  options={["降序", "升序"]}
                  value={reverse ? "升序" : "降序"}
                  onChange={handleReverseChange}
                />
              </Flex>
            ),
          },
        ]}
      />

      {query && (
        <Flex align="center" justify="space-between" gap="small" wrap>
          <Text type="secondary">“{query}” 的搜索结果</Text>
          {page && <Text type="secondary">共 {page.total} 条</Text>}
        </Flex>
      )}

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
        empty={emptyState}
        minItemWidth={340}
      />
      </Flex>
    </>
  );
}
