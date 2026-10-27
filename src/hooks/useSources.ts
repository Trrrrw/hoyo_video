import { useEffect, useState } from "react";
import { fetchSources } from "../api/sources";
import type { NewsSourceInfo } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

export function useSources(gameId: string) {
  const handleBackendError = useReportBackendError();
  const [sources, setSources] = useState<NewsSourceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(gameId));
  const [loadedGameId, setLoadedGameId] = useState<string>();

  const [previousGameId, setPreviousGameId] = useState(gameId);
  if (previousGameId !== gameId) {
    setPreviousGameId(gameId);
    setSources([]);
    setIsLoading(Boolean(gameId));
    setLoadedGameId(undefined);
  }

  useEffect(() => {
    let cancelled = false;

    if (!gameId) {
      return () => {
        cancelled = true;
      };
    }

    void fetchSources(gameId)
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
