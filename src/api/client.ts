import { createResponse, responseCache } from "./cache";
import type { QueryParams } from "./types";

const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_BASE ?? "https://akasha.trrw.cn";

export function backendUrl(path: string): string {
  return new URL(path, BACKEND_BASE).href;
}

export class BackendError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

export async function backendFetch(
  path: string,
  query?: QueryParams,
): Promise<Response> {
  const url = new URL(path, BACKEND_BASE);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null) url.searchParams.set(key, String(value));
    }
  }

  const cacheKey = url.href;
  let request = responseCache.get(cacheKey);

  if (!request) {
    const requestStart = import.meta.env.DEV
      ? new Promise<void>((resolve) => setTimeout(resolve, 1_000))
      : Promise.resolve();

    request = requestStart
      .then(() => fetch(url))
      .catch(() => {
        throw new BackendError(0, "无法连接到服务器");
      })
      .then(async (response) => {
        if (!response.ok) {
          throw new BackendError(
            response.status,
            `请求失败：${response.status} ${response.statusText}`,
          );
        }
        return {
          body: await response.arrayBuffer(),
          headers: [...response.headers],
          status: response.status,
          statusText: response.statusText,
        };
      });

    responseCache.set(cacheKey, request);
  }

  try {
    return createResponse(await request);
  } catch (error) {
    if (responseCache.get(cacheKey) === request) {
      responseCache.delete(cacheKey);
    }
    throw error;
  }
}
