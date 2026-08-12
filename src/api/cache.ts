export type CachedResponse = {
  body: ArrayBuffer;
  headers: [string, string][];
  status: number;
  statusText: string;
};

export const responseCache = new Map<string, Promise<CachedResponse>>();

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
