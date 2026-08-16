import { backendFetch } from "./client";
import { isListResponse, isNewsSourceInfo, parseJson } from "./parsers";
import type { ListResponse, NewsSourceInfo } from "./types";

export async function fetchSources(
  gameId: string,
): Promise<NewsSourceInfo[]> {
  const response = await backendFetch(`/api/v1/games/${gameId}/news/sources`);
  const data = await parseJson<ListResponse<NewsSourceInfo>>(
    response,
    (value): value is ListResponse<NewsSourceInfo> =>
      isListResponse(value, isNewsSourceInfo),
    "来源列表",
  );

  return data.items;
}
