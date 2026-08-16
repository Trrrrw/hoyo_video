import { backendFetch } from "./client";
import {
  isNewsDetailInfo,
  isNewsInfo,
  isPageResponse,
  parseJson,
} from "./parsers";
import type { NewsDetailInfo, NewsInfo, PageResponse } from "./types";
import { fetchNewsVideo } from "./newsVideo";

export type NewsListQuery = {
  sourceId?: string;
  q?: string;
  tags?: string[];
  newsType?: string;
  during?: string;
  limit?: number;
  reverse?: boolean;
};

type NewsListRequest = Omit<NewsListQuery, "sourceId"> & {
  sourceId: string;
  offset?: number;
};

export type NewsPage = PageResponse<
  NewsInfo,
  {
    game_id: string;
    source_id: string;
  }
>;

function toBackendTagName(tag: string): string {
  return tag === "其他" ? "__untagged__" : tag;
}

export async function fetchNewsList(
  gameId: string,
  {
    sourceId,
    q,
    tags,
    newsType,
    during,
    limit,
    offset,
    reverse,
  }: NewsListRequest,
): Promise<NewsPage> {
  const response = await backendFetch(`/api/v1/games/${gameId}/news`, {
    source_id: sourceId,
    q,
    tags: tags?.map(toBackendTagName).join(","),
    news_type: newsType,
    during,
    limit,
    offset,
    reverse,
  });

  return parseJson<NewsPage>(
    response,
    (value): value is NewsPage =>
      isPageResponse(
        value,
        isNewsInfo,
        (meta): meta is NewsPage["meta"] => {
          return (
            typeof meta === "object" &&
            meta !== null &&
            "game_id" in meta &&
            "source_id" in meta &&
            typeof meta.game_id === "string" &&
            typeof meta.source_id === "string"
          );
        },
      ),
    "视频列表",
  );
}

export async function fetchNewsDetail(
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

  if (news.news_type !== "video") return news;

  const video = await fetchNewsVideo(gameId, newsId, sourceId);
  return {
    ...news,
    video_url: video.video_url,
  };
}
