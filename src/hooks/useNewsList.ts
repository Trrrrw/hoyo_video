import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNewsList,
  type NewsListQuery,
  type NewsPage,
} from "../api/news";
import type { NewsInfo } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

export function useNewsList(gameId: string, query: NewsListQuery) {
  const handleBackendError = useReportBackendError();
  const [news, setNews] = useState<NewsInfo[]>([]);
  const [page, setPage] = useState<NewsPage>();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextOffset, setNextOffset] = useState(0);
  const requestVersion = useRef(0);

  const {
    sourceId,
    q,
    tags,
    newsType,
    during,
    limit,
    reverse,
  } = query;
  const tagsQuery = tags?.join(",");

  const fetchPage = useCallback(
    (offset: number) =>
      fetchNewsList(gameId, {
        sourceId: sourceId ?? "",
        q,
        tags: tagsQuery?.split(","),
        newsType,
        during,
        limit,
        offset,
        reverse,
      }),
    [gameId, sourceId, q, tagsQuery, newsType, during, limit, reverse],
  );

  useEffect(() => {
    let cancelled = false;
    const version = ++requestVersion.current;

    setNews([]);
    setPage(undefined);
    setIsLoading(true);
    setIsLoadingMore(false);
    setHasMore(true);
    setNextOffset(0);

    if (!sourceId) {
      setIsLoading(false);
      setHasMore(false);
      return () => {
        cancelled = true;
      };
    }

    void fetchPage(0)
      .then((data) => {
        if (cancelled || requestVersion.current !== version) return;

        setNews(data.items);
        setPage(data);
        setNextOffset(data.offset + data.items.length);
        setHasMore(data.offset + data.items.length < data.total);
      })
      .catch((error: unknown) => {
        if (!cancelled && requestVersion.current === version) {
          handleBackendError(error);
        }
      })
      .finally(() => {
        if (!cancelled && requestVersion.current === version) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    fetchPage,
    handleBackendError,
    sourceId,
  ]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore || !sourceId) return;

    const version = requestVersion.current;
    setIsLoadingMore(true);

    try {
      const data = await fetchPage(nextOffset);
      if (requestVersion.current !== version) return;

      setNews((current) => [...current, ...data.items]);
      setPage(data);
      setNextOffset(data.offset + data.items.length);
      setHasMore(data.offset + data.items.length < data.total);
    } catch (error) {
      if (requestVersion.current === version) handleBackendError(error);
    } finally {
      if (requestVersion.current === version) setIsLoadingMore(false);
    }
  }, [
    fetchPage,
    handleBackendError,
    hasMore,
    isLoading,
    isLoadingMore,
    nextOffset,
    sourceId,
  ]);

  return {
    news,
    page,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
  };
}
