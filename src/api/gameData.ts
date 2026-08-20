import { backendFetch } from "./client";
import { isGameDataPage, parseJson } from "./parsers";
import type { GameCharacter, GameDataEntry, PageResponse } from "./types";

const characterCollection = "character";
const pageSize = 100;

type GameDataPage = PageResponse<GameDataEntry, unknown>;

export async function fetchGameCharacters(
  gameId: string,
): Promise<GameCharacter[]> {
  const characters: GameCharacter[] = [];
  let offset = 0;

  while (true) {
    const response = await backendFetch(
      `/api/v1/games/${encodeURIComponent(gameId)}/data/${characterCollection}`,
      { limit: pageSize, offset },
    );
    const page = await parseJson<GameDataPage>(
      response,
      isGameDataPage,
      "角色列表",
    );

    for (const item of page.items) {
      if (item.name) {
        characters.push({
          id: item.id,
          name: item.name,
          icon: item.icon,
        });
      }
    }

    const nextOffset = page.offset + page.items.length;
    if (page.items.length === 0 || nextOffset >= page.total) break;
    offset = nextOffset;
  }

  return characters;
}
