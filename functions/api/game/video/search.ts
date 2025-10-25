interface ContextParams {
    game: string
    q: string
}

interface RequestContext {
    params: ContextParams
    request: Request
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url)
    const game = url.searchParams.get("game")
    const q = url.searchParams.get("q")
    if (!game || !q) {
        return new Response("Missing required query parameters", { status: 400 })
    }
    const results = await search_videos(game, q)
    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
    })
}

async function search_videos(game: string, q: string) {
    const response = await fetch(`https://api.trrw.tech/hoyo_video/search?game=${game}&q=${encodeURIComponent(q)}`)
    return response.json()
}