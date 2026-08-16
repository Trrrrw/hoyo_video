import { backendUrl } from "../api/client";

const defaultRssLimit = 50;

type NewsRssUrlOptions = {
  gameId: string;
  sourceId: string;
  tags?: readonly string[];
  during?: string;
  q?: string;
  limit?: number;
};

export function buildNewsRssUrl({
  gameId,
  sourceId,
  tags,
  during,
  q,
  limit = defaultRssLimit,
}: NewsRssUrlOptions): string {
  const url = new URL(backendUrl(`/api/v1/games/${gameId}/news/rss`));

  url.searchParams.set("source_id", sourceId);
  url.searchParams.set("news_type", "video");
  url.searchParams.set("limit", String(limit));

  if (q?.trim()) url.searchParams.set("q", q.trim());
  if (tags && tags.length > 0) url.searchParams.set("tags", tags.join(","));
  if (during) url.searchParams.set("during", during);

  return url.href;
}
