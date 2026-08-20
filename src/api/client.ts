import {
  createResponse,
  deleteInFlightResponse,
  getCachedResponse,
  getInFlightResponse,
  setCachedResponse,
  setInFlightResponse,
  type CachedResponse,
} from "./cache";
import type { QueryParams } from "./types";

const isDevelopmentMode = import.meta.env.MODE === "development";
const configuredBackendBase = import.meta.env.VITE_BACKEND_BASE?.trim();
const developmentBackendBase = isDevelopmentMode
  ? import.meta.env.VITE_DEV_BACKEND_BASE?.trim()
  : undefined;
const BACKEND_BASE =
  configuredBackendBase || developmentBackendBase || "https://akasha.trrw.cn";

const API_DELAY_MS = readNonNegativeInteger(
  import.meta.env.VITE_DEV_API_DELAY_MS,
  isDevelopmentMode ? 1_000 : 0,
);
const API_TIMEOUT_MS = readPositiveInteger(
  import.meta.env.VITE_API_TIMEOUT_MS,
  15_000,
);
const METADATA_CACHE_TTL_MS = 5 * 60 * 1_000;

function readNonNegativeInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getCompletedCacheTtl(url: URL) {
  if (
    url.pathname === "/api/v1/games" ||
    url.pathname.endsWith("/news/sources") ||
    url.pathname.endsWith("/news/tags")
  ) {
    return METADATA_CACHE_TTL_MS;
  }

  return 0;
}

function wait(milliseconds: number) {
  if (milliseconds === 0) return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

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

async function requestBackend(url: URL): Promise<CachedResponse> {
  await wait(API_DELAY_MS);

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
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
  } catch (error) {
    if (error instanceof BackendError) throw error;
    if (timedOut) throw new BackendError(0, "请求超时，请稍后重试");
    throw new BackendError(0, "无法连接到服务器");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function backendFetch(
  path: string,
  query?: QueryParams,
): Promise<Response> {
  const url = new URL(path, BACKEND_BASE);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value == null) continue;

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const cacheKey = url.href;
  const cachedResponse = getCachedResponse(cacheKey);
  if (cachedResponse) return createResponse(cachedResponse);

  const completedCacheTtl = getCompletedCacheTtl(url);
  const inFlightRequest = getInFlightResponse(cacheKey);
  if (inFlightRequest) return createResponse(await inFlightRequest);

  const request = requestBackend(url);
  setInFlightResponse(cacheKey, request);

  try {
    const response = await request;
    setCachedResponse(cacheKey, response, completedCacheTtl);
    return createResponse(response);
  } finally {
    deleteInFlightResponse(cacheKey, request);
  }
}
