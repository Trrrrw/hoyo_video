export type Aria2Settings = {
  rpcUrl: string;
  secret: string;
  downloadDir: string;
};

export type Aria2Version = {
  version: string;
  enabledFeatures: string[];
};

type Aria2RpcError = {
  code: number;
  message: string;
};

type Aria2RpcResponse<T> = {
  jsonrpc: "2.0";
  id: string;
  result?: T;
  error?: Aria2RpcError;
};

function normalizeRpcUrl(value: string) {
  const url = new URL(value.trim());

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("RPC 地址必须使用 http:// 或 https://");
  }

  if (url.pathname === "/") url.pathname = "/jsonrpc";
  return url.href;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAria2Version(value: unknown): value is Aria2Version {
  return (
    isRecord(value) &&
    typeof value.version === "string" &&
    Array.isArray(value.enabledFeatures) &&
    value.enabledFeatures.every((feature) => typeof feature === "string")
  );
}

async function callAria2<T>(
  settings: Aria2Settings,
  method: string,
  params: unknown[] = [],
): Promise<T> {
  const rpcUrl = normalizeRpcUrl(settings.rpcUrl);
  const authenticatedParams = settings.secret.trim()
    ? [`token:${settings.secret.trim()}`, ...params]
    : params;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: crypto.randomUUID(),
        method,
        params: authenticatedParams,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`RPC 请求失败：HTTP ${response.status}`);
    }

    const data = (await response.json()) as Aria2RpcResponse<T>;

    if (data.error) {
      throw new Error(`Aria2 ${data.error.code}：${data.error.message}`);
    }

    if (data.result === undefined) {
      throw new Error("Aria2 返回了无效响应");
    }

    return data.result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("连接 Aria2 超时");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function getAria2Version(settings: Aria2Settings) {
  const result = await callAria2<unknown>(settings, "aria2.getVersion");
  if (!isAria2Version(result)) {
    throw new Error("Aria2 返回了无效版本信息");
  }
  return result;
}

export async function addAria2Uri(
  settings: Aria2Settings,
  uri: string,
  options: { dir?: string; out: string; allowOverwrite?: boolean },
) {
  const result = await callAria2<unknown>(settings, "aria2.addUri", [
    [uri],
    {
      ...(options.dir ? { dir: options.dir } : {}),
      ...(options.allowOverwrite
        ? { "allow-overwrite": "true", "auto-file-renaming": "false" }
        : {}),
      out: options.out,
    },
  ]);

  if (typeof result !== "string") {
    throw new Error("Aria2 返回了无效任务 ID");
  }
  return result;
}
