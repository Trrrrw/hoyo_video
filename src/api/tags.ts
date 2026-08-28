import { backendFetch } from "./client";
import { isTagsResponse, parseJson } from "./parsers";
import type { TagsResponse } from "./types";

export async function fetchTags(
  gameId: string,
  sourceId: string,
): Promise<TagsResponse> {
  const response = await backendFetch(
    `/api/v1/games/${encodeURIComponent(gameId)}/news/tags`,
    {
      source: sourceId,
    },
  );

  return parseJson<TagsResponse>(response, isTagsResponse, "标签列表");
}
