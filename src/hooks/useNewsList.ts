import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNewsList,
  type NewsListQuery,
  type NewsPage,
} from "../api/news";
import type { NewsInfo } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

type NewsListCacheEntry = {
  news: NewsInfo[];
  page: NewsPage;
  nextOffset: number;
  hasMore: boolean;
  updatedAt: number;
};

type NewsListState = {
  requestKey: string;
  news: NewsInfo[];
  page?: NewsPage;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  nextOffset: number;
};

const newsListCache = new Map<string, NewsListCacheEntry>();
const NEWS_LIST_CACHE_TTL_MS = 5 * 60 * 1_000;
const NEWS_LIST_CACHE_MAX_ENTRIES = 20;

function getCachedNewsList(requestKey: string) {
  const cached = newsListCache.get(requestKey);
  if (!cached) return undefined;

  if (Date.now() - cached.updatedAt > NEWS_LIST_CACHE_TTL_MS) {
    newsListCache.delete(requestKey);
    return undefined;
  }

  newsListCache.delete(requestKey);
  newsListCache.set(requestKey, cached);
  return cached;
}

function cacheNewsList(
  requestKey: string,
  entry: Omit<NewsListCacheEntry, "updatedAt">,
) {
  newsListCache.delete(requestKey);
  newsListCache.set(requestKey, { ...entry, updatedAt: Date.now() });

  while (newsListCache.size > NEWS_LIST_CACHE_MAX_ENTRIES) {
    const oldestKey = newsListCache.keys().next().value;
    if (oldestKey === undefined) break;
    newsListCache.delete(oldestKey);
  }
}

function createNewsListState(
  requestKey: string,
  sourceReady: boolean,
  cached?: NewsListCacheEntry,
): NewsListState {
  if (cached) {
    return {
      requestKey,
      news: cached.news,
      page: cached.page,
      isLoading: false,
      isLoadingMore: false,
      hasMore: cached.hasMore,
      nextOffset: cached.nextOffset,
    };
  }

  return {
    requestKey,
    news: [],
    isLoading: sourceReady,
    isLoadingMore: false,
    hasMore: sourceReady,
    nextOffset: 0,
  };
}

function parseStringArrayKey(key: string): string[] | undefined {
  const value = JSON.parse(key) as string[] | null;
  return value ?? undefined;
}

export function useNewsList(gameId: string, query: NewsListQuery) {
  const handleBackendError = useReportBackendError();
  const requestVersion = useRef(0);
  const loadingMore = useRef(false);

  const {
    sourceId,
    q,
    tags,
    characters,
    newsType,
    during,
    limit,
    reverse,
  } = query;
  const tagsKey = JSON.stringify(tags ?? null);
  const charactersKey = JSON.stringify(characters ?? null);
  const requestKey = JSON.stringify([
    gameId,
    sourceId ?? null,
    q ?? null,
    tagsKey,
    charactersKey,
    newsType ?? null,
    during ?? null,
    limit ?? null,
    reverse ?? false,
  ]);
  const [state, setState] = useState<NewsListState>(() =>
    createNewsListState(
      requestKey,
      Boolean(sourceId),
      sourceId ? getCachedNewsList(requestKey) : undefined,
    ),
  );
  const visibleState =
    state.requestKey === requestKey
      ? state
      : createNewsListState(
          requestKey,
          Boolean(sourceId),
          sourceId ? getCachedNewsList(requestKey) : undefined,
        );
  const {
    news,
    page,
    isLoading,
    isLoadingMore,
    hasMore,
    nextOffset,
  } = visibleState;

  const fetchPage = useCallback(
    (offset: number) =>
      fetchNewsList(gameId, {
        sourceId: sourceId ?? "",
        q,
        tags: parseStringArrayKey(tagsKey),
        characters: parseStringArrayKey(charactersKey),
        newsType,
        during,
        limit,
        offset,
        reverse,
      }),
    [
      gameId,
      sourceId,
      q,
      tagsKey,
      charactersKey,
      newsType,
      during,
      limit,
      reverse,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    const version = ++requestVersion.current;
    const cached = sourceId ? getCachedNewsList(requestKey) : undefined;

    loadingMore.current = false;
    setState(createNewsListState(requestKey, Boolean(sourceId), cached));

    if (!sourceId) {
      return () => {
        cancelled = true;
      };
    }

    if (cached) {
      return () => {
        cancelled = true;
      };
    }

    void fetchPage(0)
      .then((data) => {
        if (cancelled || requestVersion.current !== version) return;

        const nextOffset = data.offset + data.items.length;
        const hasMore = nextOffset < data.total;
        cacheNewsList(requestKey, {
          news: data.items,
          page: data,
          nextOffset,
          hasMore,
        });
        setState({
          requestKey,
          news: data.items,
          page: data,
          isLoading: false,
          isLoadingMore: false,
          hasMore,
          nextOffset,
        });
      })
      .catch((error: unknown) => {
        if (!cancelled && requestVersion.current === version) {
          handleBackendError(error);
        }
      })
      .finally(() => {
        if (!cancelled && requestVersion.current === version) {
          setState((current) =>
            current.requestKey === requestKey
              ? { ...current, isLoading: false }
              : current,
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPage, handleBackendError, requestKey, sourceId]);

  const loadMore = useCallback(async () => {
    if (
      isLoading ||
      loadingMore.current ||
      !hasMore ||
      !sourceId
    ) {
      return;
    }

    const version = requestVersion.current;
    loadingMore.current = true;
    setState((current) =>
      current.requestKey === requestKey
        ? { ...current, isLoadingMore: true }
        : current,
    );

    try {
      const data = await fetchPage(nextOffset);
      if (requestVersion.current !== version) return;

      const nextNews = [...news, ...data.items];
      const nextPageOffset = data.offset + data.items.length;
      const nextHasMore = nextPageOffset < data.total;
      cacheNewsList(requestKey, {
        news: nextNews,
        page: data,
        nextOffset: nextPageOffset,
        hasMore: nextHasMore,
      });
      setState({
        requestKey,
        news: nextNews,
        page: data,
        isLoading: false,
        isLoadingMore: false,
        hasMore: nextHasMore,
        nextOffset: nextPageOffset,
      });
    } catch (error) {
      if (requestVersion.current === version) handleBackendError(error);
    } finally {
      if (requestVersion.current === version) {
        loadingMore.current = false;
        setState((current) =>
          current.requestKey === requestKey
            ? { ...current, isLoadingMore: false }
            : current,
        );
      }
    }
  }, [
    fetchPage,
    handleBackendError,
    hasMore,
    isLoading,
    nextOffset,
    news,
    requestKey,
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
