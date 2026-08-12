import { useEffect, useState } from "react";
import { useBackendErrorNavigation } from "../hooks/useBackendErrorNavigation";
import { backendFetch } from "./client";
import type { ListResponse } from "./types";

export type NewsSourceInfo = {
  id: string;
  name: string;
  index: number;
};

export async function getSources(gameId: string): Promise<NewsSourceInfo[]> {
  const response = await backendFetch(`/api/v1/games/${gameId}/news/sources`);
  const data = (await response.json()) as ListResponse<NewsSourceInfo>;

  return data.items;
}

export function useSources(gameId: string) {
  const handleBackendError = useBackendErrorNavigation();
  const [sources, setSources] = useState<NewsSourceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedGameId, setLoadedGameId] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    setSources([]);
    setIsLoading(true);
    setLoadedGameId(undefined);

    if (!gameId) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    void getSources(gameId)
      .then((data) => {
        if (!cancelled) {
          setSources(data);
          setLoadedGameId(gameId);
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
  }, [gameId, handleBackendError]);

  return { sources, loadedGameId, isLoading };
}
