interface ContextParams {
    q: string;
    game: string;
}

interface RequestContext {
    params: ContextParams;
    request: Request;
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url);
    const q = url.searchParams.get("q");
    const game = url.searchParams.get("game");
    if (q && game) {
        const results = await search(q, game);
        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        });
    }
    return new Response("Missing query parameters", { status: 400 });
}

async function search(q: string, game: string) {
    const response = await fetch(`https://api.trrw.tech/hoyo_video/search?q=${q}&game=${game}`);
    return response.json();
}