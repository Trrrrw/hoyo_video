export async function onRequestGet(): Promise<Response> {
    const results = await get_update_time()
    return results
}

async function get_update_time() {
    const response = await fetch('https://api.trrw.tech/hoyo_video/update_time')
    return response
}