export type CachedResponse = {
  body: ArrayBuffer;
  headers: [string, string][];
  status: number;
  statusText: string;
};

type CompletedCacheEntry = {
  response: CachedResponse;
  expiresAt: number;
  size: number;
};

const MAX_COMPLETED_CACHE_ENTRIES = 32;
const MAX_COMPLETED_CACHE_BYTES = 8 * 1024 * 1024;

const inFlightResponseCache = new Map<string, Promise<CachedResponse>>();
const completedResponseCache = new Map<string, CompletedCacheEntry>();
let completedCacheBytes = 0;

function removeCompletedResponse(key: string) {
  const entry = completedResponseCache.get(key);
  if (!entry) return;

  completedResponseCache.delete(key);
  completedCacheBytes -= entry.size;
}

export function getInFlightResponse(key: string) {
  return inFlightResponseCache.get(key);
}

export function setInFlightResponse(
  key: string,
  request: Promise<CachedResponse>,
) {
  inFlightResponseCache.set(key, request);
}

export function deleteInFlightResponse(
  key: string,
  request: Promise<CachedResponse>,
) {
  if (inFlightResponseCache.get(key) === request) {
    inFlightResponseCache.delete(key);
  }
}

export function getCachedResponse(key: string): CachedResponse | undefined {
  const entry = completedResponseCache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    removeCompletedResponse(key);
    return undefined;
  }

  completedResponseCache.delete(key);
  completedResponseCache.set(key, entry);
  return entry.response;
}

export function setCachedResponse(
  key: string,
  response: CachedResponse,
  maxAgeMs: number,
) {
  if (maxAgeMs <= 0 || response.body.byteLength > MAX_COMPLETED_CACHE_BYTES) {
    return;
  }

  removeCompletedResponse(key);

  const entry: CompletedCacheEntry = {
    response,
    expiresAt: Date.now() + maxAgeMs,
    size: response.body.byteLength,
  };
  completedResponseCache.set(key, entry);
  completedCacheBytes += entry.size;

  while (
    completedResponseCache.size > MAX_COMPLETED_CACHE_ENTRIES ||
    completedCacheBytes > MAX_COMPLETED_CACHE_BYTES
  ) {
    const oldestKey = completedResponseCache.keys().next().value;
    if (oldestKey === undefined) break;
    removeCompletedResponse(oldestKey);
  }
}

export function createResponse(cached: CachedResponse): Response {
  return new Response(
    cached.body.byteLength === 0 ? null : cached.body.slice(0),
    {
      status: cached.status,
      statusText: cached.statusText,
      headers: cached.headers,
    },
  );
}
