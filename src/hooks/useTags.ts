import { useEffect, useState } from "react";
import { fetchTags } from "../api/tags";
import type { TagGroupInfo, TagInfo } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

function toDisplayTag(tag: TagInfo): TagInfo {
  return {
    ...tag,
    name: tag.name === "__untagged__" ? "其他" : tag.name,
  };
}

export function useTags(gameId: string, sourceId: string | undefined) {
  const handleBackendError = useReportBackendError();
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

    void fetchTags(gameId, sourceId)
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
