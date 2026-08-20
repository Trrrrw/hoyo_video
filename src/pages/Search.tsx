import {
  Button,
  Collapse,
  DatePicker,
  Flex,
  Input,
  Popover,
  Segmented,
  Select,
  Typography,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { IconHelpCircle, IconRss } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { backendUrl } from "../api/client";
import { useCopyText } from "../hooks/useCopyText";
import { useGameCharacters } from "../hooks/useGameCharacters";
import { useGames } from "../hooks/useGames";
import { useNewsList } from "../hooks/useNewsList";
import { useSources } from "../hooks/useSources";
import { useTags } from "../hooks/useTags";
import CardGrid from "../components/cards/CardGrid";
import VideoCard from "../components/cards/VideoCard";
import EmptyMark from "../assets/home-mark/home-mark-1.avif";
import {
  formatDuringParam,
  parseDuringParam,
} from "../utils/newsFilterParams";
import { buildNewsRssUrl } from "../utils/newsRss";
import { SearchSkeleton } from "../components/LoadingSkeletons";
import DocumentTitle from "../components/DocumentTitle";

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
  const selectedCharacters = searchParams.getAll("character");
  const during = searchParams.get("during") ?? undefined;
  const duringValue = parseDuringParam(searchParams.get("during"));
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
  const {
    characters,
    isLoading: isCharactersLoading,
  } = useGameCharacters(gameId ?? "");
  const hasSearchCriteria = Boolean(
    query || selectedTags.length > 0 || selectedCharacters.length > 0,
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
    sourceId: hasSearchCriteria && source ? source.id : undefined,
    q: query || undefined,
    newsType: "video",
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    characters:
      selectedCharacters.length > 0 ? selectedCharacters : undefined,
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
        current.delete("character");
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
      current.delete("character");
      return current;
    });
  };

  const handleDuringChange = (dates: Parameters<NonNullable<React.ComponentProps<typeof RangePicker>["onChange"]>>[0]) => {
    const nextDuring = formatDuringParam(dates);
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

  const handleCharactersChange = (nextCharacters: string[]) => {
    setSearchParams(
      (current) => {
        current.delete("character");
        nextCharacters.forEach((character) =>
          current.append("character", character),
        );
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
      characters: selectedCharacters,
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
        <DocumentTitle title={pageTitle} />
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
        {hasSearchCriteria ? "没有找到匹配的视频" : "请输入关键词或选择筛选条件"}
      </Text>
    </Flex>
  );

  return (
    <>
      <DocumentTitle title={pageTitle} />
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
          <Flex align="center" gap="small" className="min-w-60 flex-1">
            <Input.Search
              className="min-w-0 flex-1!"
              value={searchValue}
              enterButton
              allowClear
              placeholder={`在${game.name}中搜索视频`}
              onChange={(event) => setSearchValue(event.target.value)}
              onSearch={handleSearch}
            />
            <Popover
              placement="bottomRight"
              trigger="click"
              title="搜索语法"
              content={
                <Flex vertical gap="small" className="w-64">
                  <Text>空格：同时匹配多个关键词（AND）</Text>
                  <Text>
                    <span className="font-mono">|</span>：匹配任意一个关键词（OR）
                  </Text>
                  <Text>
                    <span className="font-mono">-关键词</span>：排除关键词
                  </Text>
                  <Text>
                    <span className="font-mono">"完整短语"</span>：按完整短语匹配
                  </Text>
                  <Text>
                    <span className="font-mono">{"\\"}</span>：转义特殊字符
                  </Text>
                  <Text type="secondary" className="text-xs!">
                    示例：原神 角色 | PV -复刻
                  </Text>
                </Flex>
              }
            >
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<IconHelpCircle size={16} />}
                aria-label="查看搜索语法"
              />
            </Popover>
          </Flex>
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
                <Select
                  mode="multiple"
                  allowClear
                  className="min-w-52"
                  placeholder="筛选角色"
                  loading={isCharactersLoading}
                  value={selectedCharacters}
                  options={characters.map((character) => ({
                    label: character.name,
                    value: character.id,
                  }))}
                  showSearch={{ optionFilterProp: "label" }}
                  maxTagCount="responsive"
                  onChange={handleCharactersChange}
                  aria-label="筛选角色"
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

      {hasSearchCriteria && (
        <Flex align="center" justify="space-between" gap="small" wrap>
          <Text type="secondary">
            {query ? `“${query}” 的搜索结果` : "筛选结果"}
          </Text>
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
