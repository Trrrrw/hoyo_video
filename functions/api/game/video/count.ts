interface ContextParams {
    game: string
    video_id: number
}

interface RequestContext {
    params: ContextParams
    request: Request
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url)
    const game = url.searchParams.get("game")
    const video_id = url.searchParams.get("video_id")
    if (!game || !video_id) {
        return new Response(
            JSON.stringify({ error: "Missing 'game' or 'video_id' parameter" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        )
    }

    const key = `${game}_${video_id}`
    try {
        let count = await video_play_count.get(key)
        if (!count) {
            count = 0
            await video_play_count.put(key, String(count))
        }
        return new Response(JSON.stringify({ count: Number(count) }), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        return new Response(JSON.stringify({ count: 0 }), {
            headers: { "Content-Type": "application/json" },
        })
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