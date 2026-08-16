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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setNews(undefined);

    if (!gameId || !newsId || !sourceId) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);

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
