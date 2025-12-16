// 缓存存储结构
const cacheMap = new Map<string, any>();
// 正在进行的请求（用于去重）
const pendingPromises = new Map<string, Promise<any>>();

/**
 * 通用的带缓存 Fetch 函数
 * @param key 缓存唯一标识 (通常是 URL)
 * @param fetcher 实际发起请求的函数
 */
export async function fetchWithCache<T>(
    key: string, 
    fetcher: () => Promise<T>
): Promise<T> {
    // 1. 检查内存缓存
    if (cacheMap.has(key)) {
        return cacheMap.get(key) as T;
    }

    // 2. 检查是否有正在进行的同名请求 (请求去重)
    if (pendingPromises.has(key)) {
        return pendingPromises.get(key) as Promise<T>;
    }

    // 3. 发起新请求
    const promise = fetcher().then((data) => {
        cacheMap.set(key, data); // 成功后写入缓存
        return data;
    }).catch((err) => {
        // 失败时不缓存，直接抛出，由调用者处理
        throw err;
    }).finally(() => {
        // 无论成功失败，请求结束后清理 pending 标记
        pendingPromises.delete(key);
    });

    // 标记该请求正在进行
    pendingPromises.set(key, promise);

    return promise;
}

// 可选：提供一个手动清理缓存的方法
export function clearCache(key?: string) {
    if (key) {
        cacheMap.delete(key);
    } else {
        cacheMap.clear();
    }
}
