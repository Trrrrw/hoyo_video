import { backendFetch } from "./client";
import { isCharacterPage, parseJson } from "./parsers";
import type { GameCharacter, PageResponse } from "./types";

/** 仅读取角色筛选需要的目录，不推断各游戏的详细资料结构 */
export async function fetchGameCharacters(
  gameId: string,
): Promise<GameCharacter[]> {
  const characters: GameCharacter[] = [];
  let offset = 0;
  while (true) {
    const response = await backendFetch(
      `/api/v1/games/${encodeURIComponent(gameId)}/characters`,
      { limit: 100, offset },
    );
    const page = await parseJson<PageResponse<GameCharacter, unknown>>(
      response,
      isCharacterPage,
      "角色列表",
    );
    characters.push(...page.items);
    offset += page.items.length;
    if (page.items.length === 0 || offset >= page.total) return characters;
  }
}
