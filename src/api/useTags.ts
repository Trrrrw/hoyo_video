import { useEffect, useState } from "react";
import { useBackendErrorNavigation } from "../hooks/useBackendErrorNavigation";
import { backendFetch } from "./client";
import { isTagsResponse, parseJson } from "./parse";
import type { TagGroupInfo, TagInfo, TagsResponse } from "./types";

export type { TagGroupInfo, TagInfo, TagsResponse } from "./types";

function toDisplayTag(tag: TagInfo): TagInfo {
  return {
    ...tag,
    name: tag.name === "__untagged__" ? "其他" : tag.name,
  };
}

export async function getTags(
  gameId: string,
  sourceId: string,
): Promise<TagsResponse> {
  const response = await backendFetch(`/api/v1/games/${gameId}/news/tags`, {
    source_id: sourceId,
  });

  return parseJson<TagsResponse>(response, isTagsResponse, "标签列表");
}

export function useTags(gameId: string, sourceId: string | undefined) {
  const handleBackendError = useBackendErrorNavigation();
  const [tagGroups, setTagGroups] = useState<TagGroupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedSourceId, setLoadedSourceId] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    setTagGroups([]);
    setIsLoading(true);
    setLoadedSourceId(undefined);

    if (!sourceId) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    void getTags(gameId, sourceId)
      .then((data) => {
        if (!cancelled) {
          setTagGroups(
            data.groups.map((group) => ({
              ...group,
              tags: group.tags.map(toDisplayTag),
            })),
          );
          setLoadedSourceId(sourceId);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) handleBackendError(error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, sourceId, handleBackendError]);

  const videoTagGroups = tagGroups
    .map((group) => ({
      ...group,
      tags: group.tags
        .filter((tag) => tag.news_count.video > 0)
        .sort((a, b) => a.index - b.index),
    }))
    .filter((group) => group.tags.length > 0)
    .sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity));

  return {
    tagGroups: videoTagGroups,
    tags: videoTagGroups.flatMap((group) => group.tags),
    loadedSourceId,
    isLoading,
  };
}
