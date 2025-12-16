interface RequestContext {
    request: Request;
}

export async function onRequest(context: RequestContext): Promise<Response> {
    const url = new URL(context.request.url);
    const isRss = url.pathname.endsWith('.xml');

    url.protocol = 'https:';
    url.hostname = 'api.trrw.tech';
    url.port = '';

    url.pathname = url.pathname
        .replace('/api', '/hoyo_video')
        .replace('.xml', '/rss');

    const proxyRequest = new Request(url.toString(), context.request);
    proxyRequest.headers.set('Host', url.hostname);
    const response = await fetch(proxyRequest);

    const newHeaders = new Headers(response.headers);
    if (response.status === 200) {
        newHeaders.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
        newHeaders.delete("Pragma");
        newHeaders.delete("Expires");
    }
    newHeaders.delete("Content-Encoding");
    newHeaders.delete("Content-Length");

    if (isRss) {
        newHeaders.set("Content-Type", "application/xml; charset=utf-8");
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}
