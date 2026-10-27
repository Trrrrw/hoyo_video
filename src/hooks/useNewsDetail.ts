import { useEffect, useState } from "react";
import { fetchNewsDetail } from "../api/news";
import type { NewsDetailInfo } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

export function useNewsDetail(
  gameId: string | undefined,
  newsId: string | undefined,
  sourceId: string | undefined,
) {
  const handleBackendError = useReportBackendError();
  const [news, setNews] = useState<NewsDetailInfo>();
  const [isLoading, setIsLoading] = useState(
    Boolean(gameId && newsId && sourceId),
  );

  const requestKey = JSON.stringify([gameId, newsId, sourceId]);
  const [previousRequestKey, setPreviousRequestKey] = useState(requestKey);
  if (previousRequestKey !== requestKey) {
    setPreviousRequestKey(requestKey);
    setNews(undefined);
    setIsLoading(Boolean(gameId && newsId && sourceId));
  }

  useEffect(() => {
    let cancelled = false;

    if (!gameId || !newsId || !sourceId) {
      return () => {
        cancelled = true;
      };
    }

    void fetchNewsDetail(gameId, newsId, sourceId)
      .then((data) => {
        if (!cancelled) setNews(data);
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
  }, [gameId, handleBackendError, newsId, sourceId]);

  return { news, isLoading };
}
