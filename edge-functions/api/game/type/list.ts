interface ContextParams {
    game: string;
}

interface RequestContext {
    params: ContextParams;
    request: Request;
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url);
    const game = url.searchParams.get("game");
    if (game) {
        console.log(`Fetching type list for game:"${game}"`);
        const results = await get_type_list(game);
        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response("Missing query parameters", { status: 400 });
}

async function get_type_list(game: string) {
    const response = await fetch(`https://api.trrw.tech/hoyo_video/get_type_list?game=${game}`);
    return response.json();
}