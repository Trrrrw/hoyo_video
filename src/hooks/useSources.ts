import { useEffect, useState } from "react";
import { fetchSources } from "../api/sources";
import type { NewsSourceInfo } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

export function useSources(gameId: string) {
  const handleBackendError = useReportBackendError();
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
