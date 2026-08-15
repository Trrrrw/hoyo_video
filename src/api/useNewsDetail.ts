import { useEffect, useState } from "react";
import { useBackendErrorNavigation } from "../hooks/useBackendErrorNavigation";
import { backendFetch } from "./client";
import { isNewsDetailInfo, parseJson } from "./parse";
import type { NewsDetailInfo } from "./types";
import { getNewsVideo } from "./useNewsVideo";

export async function getNewsDetail(
  gameId: string,
  newsId: string,
  sourceId: string,
): Promise<NewsDetailInfo> {
  const response = await backendFetch(`/api/v1/games/${gameId}/news/${newsId}`, {
    source_id: sourceId,
  });

  const news = await parseJson<NewsDetailInfo>(
    response,
    isNewsDetailInfo,
    "视频详情",
  );

  if (news.news_type === "video") {
    const video = await getNewsVideo(gameId, newsId, sourceId);
    return {
      ...news,
      video_url: video.video_url,
    };
  }

  return news;
}

export function useNewsDetail(
  gameId: string | undefined,
  newsId: string | undefined,
  sourceId: string | undefined,
) {
  const handleBackendError = useBackendErrorNavigation();
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

    void getNewsDetail(gameId, newsId, sourceId)
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
