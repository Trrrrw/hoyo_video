interface ContextParams {
    game: string
    type: string
    page?: number
    page_size?: number
    all?: boolean
}

interface RequestContext {
    params: ContextParams
    request: Request
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url)
    const game = url.searchParams.get("game")
    const type = url.searchParams.get("type")
    const page = url.searchParams.get("page")
    const page_size = url.searchParams.get("page_size")
    const all = url.searchParams.get("all")
    if (!game || !type) {
        return new Response("Missing required query parameters", { status: 400 })
    }

    const results = await get_video_list(
        game,
        type,
        page ? parseInt(page) : 1,
        page_size ? parseInt(page_size) : 20,
        all ? all === "true" : false
    )

    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
    })
}

async function get_video_list(game: string, type: string, page: number, page_size: number, all: boolean) {
    const response = await fetch(`https://api.trrw.tech/hoyo_video/get_video_list?game=${game}&type=${type}&page=${page}&page_size=${page_size}&all=${all}`)
    return response.json()
}