import { useEffect, useState } from "react";
import { fetchGameVersions } from "../api/games";
import type { GameVersion } from "../api/types";

const cachedVersions = new Map<string, GameVersion[]>();
const versionRequests = new Map<string, Promise<GameVersion[]>>();

function getGameVersions(gameId: string): Promise<GameVersion[]> {
  const cached = cachedVersions.get(gameId);
  if (cached) return Promise.resolve(cached);

  const existingRequest = versionRequests.get(gameId);
  if (existingRequest) return existingRequest;

  const request = fetchGameVersions(gameId)
    .then((versions) => {
      cachedVersions.set(gameId, versions);
      return versions;
    })
    .finally(() => {
      versionRequests.delete(gameId);
    });

  versionRequests.set(gameId, request);
  return request;
}

export function useGameVersions(gameId: string) {
  const [versions, setVersions] = useState<GameVersion[]>(() =>
    cachedVersions.get(gameId) ?? [],
  );
  const [isLoading, setIsLoading] = useState(
    () => Boolean(gameId) && !cachedVersions.has(gameId),
  );

  useEffect(() => {
    let cancelled = false;
    const cached = cachedVersions.get(gameId);

    setVersions(cached ?? []);
    setIsLoading(Boolean(gameId) && !cached);

    if (!gameId || cached) {
      return () => {
        cancelled = true;
      };
    }

    void getGameVersions(gameId)
      .then((data) => {
        if (!cancelled) setVersions(data);
      })
      .catch(() => {
        // 版本信息是可选元数据，失败时由时间线回退为按月分组
        if (!cancelled) setVersions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { versions, isLoading };
}
