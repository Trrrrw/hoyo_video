interface ContextParams {
    game: string
}

interface RequestContext {
    params: ContextParams
    request: Request
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url)
    const game = url.searchParams.get("game")
    const video_ids = url.searchParams.get("video_ids")
    if (!game || !video_ids) {
        return new Response(
            JSON.stringify({ error: "Missing 'game' or 'video_ids' parameter" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }

    const ids = video_ids.split(",").map(id => id.trim()).filter(Boolean)
    const result: Record<string, number> = {}

    try {
        const counts = await Promise.all(
            ids.map(async (id) => {
                const key = `${game}_${id}`
                let count = await video_play_count.get(key)
                if (!count) {
                    count = "0"
                    // await video_play_count.put(key, "0")
                }
                return [id, Number(count)] as const
            })
        )

        // 把结果组合成对象
        for (const [id, count] of counts) {
            result[id] = count
        }

        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to fetch play counts" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url)
    const game = url.searchParams.get("game")
    const video_id = url.searchParams.get("video_id")
    const key = `${game}_${video_id}`
    try {
        const countStr = await video_play_count.get(key)
        const count = Number(countStr) || 0

        const newCount = count + 1

        // 更新 KV
        await video_play_count.put(key, String(newCount))

        // 返回最新值
        return new Response(JSON.stringify({ count: newCount }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error updating play count:", error)
        return new Response(
            JSON.stringify({ error: "Failed to update play count" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}