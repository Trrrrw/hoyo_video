import { backendFetch } from "./client";
import { isGameInfo, isListResponse, parseJson } from "./parsers";
import type { GameInfo, ListResponse } from "./types";

export async function fetchGames(): Promise<GameInfo[]> {
  const response = await backendFetch("/api/v1/games");
  const data = await parseJson<ListResponse<GameInfo>>(
    response,
    (value): value is ListResponse<GameInfo> =>
      isListResponse(value, isGameInfo),
    "游戏列表",
  );

  return data.items;
}
