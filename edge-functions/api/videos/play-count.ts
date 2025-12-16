interface RequestBody {
    action?: 'get' | 'increase';
    keys: string[];
}

interface RequestContext {
    request: Request;
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
    const { request } = context;
    try {
        const body: RequestBody = await request.json();
        const { action, keys } = body;
        if (!keys || !Array.isArray(keys) || keys.length === 0) {
            return new Response(JSON.stringify({ error: "Missing or invalid 'keys'" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
        // ---------------------------------------------------------
        // 场景 A: 批量获取播放量 (action === 'get')
        // ---------------------------------------------------------
        if (action === 'get') {
            const result: Record<string, number> = {};
            await Promise.all(
                keys.map(async (key) => {
                    // 查不到默认为 "0"
                    const val = await video_play_count.get(key);
                    result[key] = Number(val || 0);
                })
            );
            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }
        // ---------------------------------------------------------
        // 场景 B: 增加播放量 (action === 'increase')
        // ---------------------------------------------------------
        if (action === 'increase') {
            const results: Record<string, number> = {};
            for (const key of keys) {
                // 1. 获取当前值
                const currentStr = await video_play_count.get(key);
                const currentVal = Number(currentStr || 0);

                // 2. 计算新值
                const newVal = currentVal + 1;

                // 3. 写入新值
                await video_play_count.put(key, String(newVal));

                results[key] = newVal;
            }
            return new Response(JSON.stringify({ success: true, updated: results }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        }
        // 如果 action 不是 get 也不是 increase
        return new Response(JSON.stringify({ error: "Invalid 'action'" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid JSON body or Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}