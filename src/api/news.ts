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
  characters?: string[];
  newsType?: string;
  during?: string;
  limit?: number;
  reverse?: boolean;
};

type NewsListRequest = Omit<NewsListQuery, "sourceId"> & {
  sourceId: string;
  offset?: number;
};

export type NewsPage = PageResponse<NewsInfo, null>;

function toBackendDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!/^\d{8}$/.test(value)) return value;

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function getPublishedRange(during: string | undefined) {
  const [start, end] = during?.split("-", 2) ?? [];

  return {
    published_from: toBackendDate(start),
    published_to: toBackendDate(end),
  };
}

export async function fetchNewsList(
  gameId: string,
  {
    sourceId,
    q,
    tags,
    characters,
    newsType,
    during,
    limit,
    offset,
    reverse,
  }: NewsListRequest,
): Promise<NewsPage> {
  const regularTags = tags?.filter((tag) => tag !== "其他");
  const hasUntagged = tags?.includes("其他") || undefined;

  const response = await backendFetch("/api/v1/news", {
    game: gameId,
    source: sourceId,
    q,
    tag: regularTags && regularTags.length > 0 ? regularTags : undefined,
    untagged: hasUntagged,
    character: characters && characters.length > 0 ? characters : undefined,
    news_type: newsType,
    ...getPublishedRange(during),
    limit,
    offset,
    order: reverse ? "asc" : "desc",
  });

  return parseJson<NewsPage>(
    response,
    (value): value is NewsPage =>
      isPageResponse(value, isNewsInfo, (meta): meta is null => meta === null),
    "视频列表",
  );
}

export async function fetchNewsDetail(
  gameId: string,
  newsId: string,
  sourceId: string,
): Promise<NewsDetailInfo> {
  const response = await backendFetch(
    `/api/v1/news/${encodeURIComponent(gameId)}/${encodeURIComponent(sourceId)}/${encodeURIComponent(newsId)}`,
  );

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
