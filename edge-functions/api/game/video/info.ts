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
    if (game && video_id) {
        const results = await get_video_info(game, parseInt(video_id))
        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        })
    }
    return new Response("Missing query parameters", { status: 400 })
}

export async function get_video_info(game: string, video_id: number) {
    const response = await fetch(`https://api.trrw.tech/hoyo_video/get_video_info?game=${game}&video_id=${video_id}`)
    return response.json()
}