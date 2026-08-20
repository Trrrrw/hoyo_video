import { useEffect, useState } from "react";
import { fetchGameCharacters } from "../api/gameData";
import type { GameCharacter } from "../api/types";
import { useReportBackendError } from "../contexts/BackendErrorContext";

const cachedCharacters = new Map<string, GameCharacter[]>();
const characterRequests = new Map<string, Promise<GameCharacter[]>>();

function getGameCharacters(gameId: string): Promise<GameCharacter[]> {
  const cached = cachedCharacters.get(gameId);
  if (cached) return Promise.resolve(cached);

  const existingRequest = characterRequests.get(gameId);
  if (existingRequest) return existingRequest;

  const request = fetchGameCharacters(gameId)
    .then((characters) => {
      cachedCharacters.set(gameId, characters);
      return characters;
    })
    .catch((error: unknown) => {
      characterRequests.delete(gameId);
      throw error;
    });

  characterRequests.set(gameId, request);
  return request;
}

export function useGameCharacters(gameId: string) {
  const handleBackendError = useReportBackendError();
  const [characters, setCharacters] = useState<GameCharacter[]>(() =>
    cachedCharacters.get(gameId) ?? [],
  );
  const [isLoading, setIsLoading] = useState(
    () => Boolean(gameId) && !cachedCharacters.has(gameId),
  );

  useEffect(() => {
    let cancelled = false;
    const cached = cachedCharacters.get(gameId);

    setCharacters(cached ?? []);
    setIsLoading(Boolean(gameId) && !cached);

    if (!gameId || cached) {
      return () => {
        cancelled = true;
      };
    }

    void getGameCharacters(gameId)
      .then((data) => {
        if (!cancelled) setCharacters(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) handleBackendError(error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, handleBackendError]);

  return { characters, isLoading };
}
