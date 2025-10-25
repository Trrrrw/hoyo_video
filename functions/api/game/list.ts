interface RequestContext {
    request: Request
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const results = await get_game_list()
    return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
    })
}

async function get_game_list() {
    const response = await fetch(`https://api.trrw.tech/hoyo_video/get_game_list`)
    return response.json()
}