interface ContextParams {
    name: string
}

interface RequestContext {
    params: ContextParams
}

export async function onRequestGet(context: RequestContext): Promise<Response> {
    const { name } = context.params
    const response = await fetch(`https://api.trrw.tech/hoyo_video/rss?game=${name}`)

    // ✅ 直接返回 Response（流转发）
    return new Response(response.body, {
        status: response.status,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
        },
    })
}