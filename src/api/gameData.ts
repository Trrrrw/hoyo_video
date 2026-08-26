import { backendFetch } from "./client";
import { isGameDataPage, parseJson } from "./parsers";
import type { GameCharacter, GameDataEntry, PageResponse } from "./types";

const characterCollection = "character";
const pageSize = 100;

type GameDataPage = PageResponse<GameDataEntry, unknown>;

function readStringField(value: unknown, key: string): string | null {
  if (typeof value !== "object" || value === null) return null;

  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" ? field : null;
}

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
      const name = item.name ?? readStringField(item.summary, "name");
      const icon =
        item.icon ??
        readStringField(item.assets, "icon") ??
        readStringField(item.summary, "icon_url");

      if (name) {
        characters.push({
          id: item.id,
          name,
          icon,
        });
      }
    }

    const nextOffset = page.offset + page.items.length;
    if (page.items.length === 0 || nextOffset >= page.total) break;
    offset = nextOffset;
  }

  return characters;
}
