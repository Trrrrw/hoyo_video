import { Button, Flex } from "antd";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import type { TagInfo } from "../api/types";
import { useGames } from "../hooks/useGames";
import { useSources } from "../hooks/useSources";
import { useTags } from "../hooks/useTags";
import AppBreadcrumb from "../components/AppBreadcrumb";
import CardGrid from "../components/cards/CardGrid";
import AllVideosCard from "../components/cards/AllVideosCard";
import TagCard from "../components/cards/TagCard";
import { useCopyText } from "../hooks/useCopyText";
import { buildNewsRssUrl } from "../utils/newsRss";
import { IconRss } from "@tabler/icons-react";
import {
  TagGridSkeleton,
  TagListSkeleton,
} from "../components/LoadingSkeletons";
import DocumentTitle from "../components/DocumentTitle";

type TagGridItem =
  | { type: "all"; key: "all" }
  | { type: "tag"; key: string; tag: TagInfo };

export default function TagList() {
  const { gameId } = useParams<"gameId">();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { games, isLoading: isGamesLoading } = useGames();
  const {
    sources,
    loadedGameId,
    isLoading: isSourcesLoading,
  } = useSources(gameId ?? "");
  const sourcesReady = !isSourcesLoading && loadedGameId === gameId;

  const game = games.find((item) => item.id === gameId);
  const sortedSources = useMemo(
    () => (sourcesReady ? [...sources].sort((a, b) => a.index - b.index) : []),
    [sources, sourcesReady],
  );
  const sourceId = searchParams.get("source");
  const source = sortedSources.find((item) => item.id === sourceId);
  const { tags, isLoading: isTagsLoading } = useTags(gameId ?? "", source?.id);
  const copyWithMessage = useCopyText();
  const tagGridItems = useMemo<TagGridItem[]>(
    () => [
      { type: "all", key: "all" },
      ...tags.map((tag) => ({ type: "tag" as const, key: tag.name, tag })),
    ],
    [tags],
  );

  useEffect(() => {
    if (!isGamesLoading && !game) {
      void navigate("/404", { replace: true });
    }
  }, [game, isGamesLoading, navigate]);

  useEffect(() => {
    if (sourcesReady && !sourceId && sortedSources[0]) {
      setSearchParams(
        (current) => {
          current.set("source", sortedSources[0]!.id);
          return current;
        },
        { replace: true },
      );
    }
  }, [setSearchParams, sortedSources, sourceId, sourcesReady]);

  useEffect(() => {
    if (
      sourcesReady &&
      ((sourceId && !source) || (!sourceId && sortedSources.length === 0))
    ) {
      void navigate("/404", { replace: true });
    }
  }, [navigate, source, sourceId, sortedSources.length, sourcesReady]);

  const pageTitle =
    game && source ? `${game.name} · ${source.name} · 标签` : "标签";

  if (isGamesLoading || !sourcesReady || !game || !source) {
    return (
      <>
        <DocumentTitle title={pageTitle} />
        <TagListSkeleton />
      </>
    );
  }

  const handleCopyRssUrl = () => {
    const rssUrl = buildNewsRssUrl({
      gameId: game.id,
      sourceId: source.id,
    });
    void copyWithMessage(rssUrl, "RSS 订阅链接已复制");
  };

  return (
    <>
      <DocumentTitle title={pageTitle} />
      <Flex vertical gap="middle" className="min-h-0 min-w-0 flex-1 p-3!">
        <h1 className="sr-only">{game.name} / {source.name} 标签</h1>
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
        />
        <Button
          type="text"
          icon={<IconRss size={14} />}
          aria-label="复制 RSS 订阅链接"
          onClick={handleCopyRssUrl}
        />
        </Flex>

        {isTagsLoading ? (
        <TagGridSkeleton count={8} minItemWidth={300} />
      ) : (
        <CardGrid
          items={tagGridItems}
          getKey={(item) => item.key}
          renderItem={(item) =>
            item.type === "all" ? (
              <AllVideosCard game={game.id} source={source.id} />
            ) : (
              <TagCard tag={item.tag} game={game.id} source={source.id} />
            )
          }
          className="min-h-0 flex-1"
          height="auto"
          minItemWidth={300}
        />
        )}
      </Flex>
    </>
  );
}
