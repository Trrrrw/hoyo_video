import { backendFetch } from "./client";
import {
  isGameInfo,
  isGameVersion,
  isListResponse,
  parseJson,
} from "./parsers";
import type { GameInfo, GameVersion, ListResponse } from "./types";

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

export async function fetchGameVersions(
  gameId: string,
): Promise<GameVersion[]> {
  const response = await backendFetch(
    `/api/v1/games/${encodeURIComponent(gameId)}/versions`,
  );
  const data = await parseJson<ListResponse<GameVersion>>(
    response,
    (value): value is ListResponse<GameVersion> =>
      isListResponse(value, isGameVersion),
    "游戏版本列表",
  );

  return data.items;
}
