import { useEffect, useState } from "react";
import { fetchGames } from "../api/games";
import type { GameInfo } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

// 游戏列表在一次页面生命周期内不会频繁变化，所有组件共享同一个缓存和请求
let cachedGames: GameInfo[] | undefined;
let gamesRequest: Promise<GameInfo[]> | null = null;

/** 获取游戏列表，并复用正在进行或已经完成的请求 */
function getGames(): Promise<GameInfo[]> {
  if (cachedGames !== undefined) {
    return Promise.resolve(cachedGames);
  }

  if (gamesRequest) {
    return gamesRequest;
  }

  gamesRequest = fetchGames()
    .then((games) => {
      cachedGames = games;
      return games;
    })
    .catch((error: unknown) => {
      // 请求失败时清除请求缓存，使下一次进入页面可以重试
      gamesRequest = null;
      throw error;
    });

  return gamesRequest;
}

/** 在组件间共享游戏列表状态 */
export function useGames() {
  const handleBackendError = useReportBackendError();
  const [games, setGames] = useState<GameInfo[]>(() => cachedGames ?? []);
  const [isLoading, setIsLoading] = useState(() => cachedGames === undefined);

  useEffect(() => {
    let cancelled = false;

    if (cachedGames !== undefined) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    void getGames()
      .then((data) => {
        if (!cancelled) setGames(data);
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
  }, [handleBackendError]);

  return { games, isLoading };
}
