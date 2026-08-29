import type { StateSnapshot } from "react-virtuoso";

type StoredVirtuosoState = {
  layoutKey: string;
  snapshot: StateSnapshot;
};

const storedStates = new Map<string, StoredVirtuosoState>();
const MAX_STORED_STATES = 20;

export function readVirtuosoState(storageKey: string, layoutKey: string) {
  const stored = storedStates.get(storageKey);
  if (!stored || stored.layoutKey !== layoutKey) return undefined;

  storedStates.delete(storageKey);
  storedStates.set(storageKey, stored);
  return stored.snapshot;
}

export function storeVirtuosoState(
  storageKey: string,
  layoutKey: string,
  snapshot: StateSnapshot,
) {
  storedStates.delete(storageKey);
  storedStates.set(storageKey, { layoutKey, snapshot });

  while (storedStates.size > MAX_STORED_STATES) {
    const oldestKey = storedStates.keys().next().value;
    if (oldestKey === undefined) break;
    storedStates.delete(oldestKey);
  }
}
