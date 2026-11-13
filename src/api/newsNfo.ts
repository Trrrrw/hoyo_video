import { backendUrl } from "./client";
import { fetchNewsList } from "./news";

function createNfoUrl(path: string, query: Record<string, string | number>) {
  const url = new URL(backendUrl(path));

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, String(value));
  }

  return url.href;
}

export function getMovieNfoUrl(
  gameId: string,
  sourceId: string,
  newsId: string,
) {
  return backendUrl(
    `/api/v1/news/${encodeURIComponent(gameId)}/${encodeURIComponent(sourceId)}/${encodeURIComponent(newsId)}/media/nfo`,
  );
}

export function getSeriesNfoUrl(
  gameId: string,
  sourceId: string,
  tagName: string,
) {
  return backendUrl(
    `/api/v1/news/${encodeURIComponent(gameId)}/${encodeURIComponent(sourceId)}/series/${encodeURIComponent(tagName)}/media/nfo`,
  );
}

export function getEpisodeNfoUrl(
  gameId: string,
  sourceId: string,
  tagName: string,
  newsId: string,
  season: number,
  episode: number,
) {
  return createNfoUrl(
    `/api/v1/news/${encodeURIComponent(gameId)}/${encodeURIComponent(sourceId)}/series/${encodeURIComponent(tagName)}/episodes/${encodeURIComponent(newsId)}/media/nfo`,
    { season, episode },
  );
}

export async function findSeriesEpisodeNumber(
  gameId: string,
  sourceId: string,
  tagName: string,
  newsId: string,
) {
  const limit = 100;
  let offset = 0;

  while (true) {
    const page = await fetchNewsList(gameId, {
      sourceId,
      tags: [tagName],
      newsType: "video",
      limit,
      offset,
      reverse: true,
    });
    const index = page.items.findIndex((item) => item.id === newsId);

    if (index >= 0) return offset + index + 1;

    const nextOffset = page.offset + page.items.length;
    if (page.items.length === 0 || nextOffset >= page.total) return null;
    offset = nextOffset;
  }
}
