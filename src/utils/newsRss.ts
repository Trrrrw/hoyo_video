import { backendUrl } from "../api/client";

const defaultRssLimit = 50;

function toBackendDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (!/^\d{8}$/.test(value)) return value;

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

type NewsRssUrlOptions = {
  gameId: string;
  sourceId: string;
  tags?: readonly string[];
  characters?: readonly string[];
  during?: string;
  q?: string;
  limit?: number;
};

export function buildNewsRssUrl({
  gameId,
  sourceId,
  tags,
  characters,
  during,
  q,
  limit = defaultRssLimit,
}: NewsRssUrlOptions): string {
  const url = new URL(backendUrl(`/api/v1/games/${gameId}/news/rss`));
  const [start, end] = during?.split("-", 2) ?? [];

  url.searchParams.set("source", sourceId);
  url.searchParams.set("news_type", "video");
  url.searchParams.set("limit", String(limit));

  if (q?.trim()) url.searchParams.set("q", q.trim());
  for (const tag of tags ?? []) {
    if (tag === "其他") {
      url.searchParams.set("untagged", "true");
    } else {
      url.searchParams.append("tag", tag);
    }
  }
  for (const character of characters ?? []) {
    url.searchParams.append("character", character);
  }
  const publishedFrom = toBackendDate(start);
  const publishedTo = toBackendDate(end);
  if (publishedFrom) url.searchParams.set("published_from", publishedFrom);
  if (publishedTo) url.searchParams.set("published_to", publishedTo);

  return url.href;
}
