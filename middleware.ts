export function middleware(context: any) {
    const { request, redirect, next } = context
    const url = new URL(request.url)

    if (url.hostname === 'hoyo-video.trrw.tech') {
        url.protocol = 'https:'
        url.hostname = 'video.trrw.cn'

        return redirect(url.toString(), 302)
    }

    return next()
}
