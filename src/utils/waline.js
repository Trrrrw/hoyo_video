const serverURL = 'https://video-waline.trrw.tech'

const options = async (url, method) => {
    await fetch(url, {
        method: 'OPTIONS',
    })
}

export const getCommentList = async (path, page, pageSize, sortBy) => {
    // Get请求
    const params = new URLSearchParams({
        path,
        page,
        pageSize,
        sortBy
    })
    const url = `${serverURL}/api/comment?${params.toString()}`
    await options(url, 'GET')
    const res = await fetch(url, { method: 'GET' })
    const resData = await res.json()
    return resData.data.data
}

// export const getCommentCount = async (url) => {
//     const params = new URLSearchParams({
//         url,
//     })
//     const res = await fetch('https://video-waline.trrw.tech/api/comment?type=recent&${params.toString()}')
//     const resData = await res.json()
// }

export const submitComment = async (comment, link, mail, nick, pid, rid, ua, url, at) => {
    // Post请求
    const baseData = {
        comment,
        link,
        mail,
        nick,
        ua,
        url
    }
    const optionalData = {
        ...(pid !== undefined && { pid }),
        ...(rid !== undefined && { rid }),
        ...(at !== undefined && { at })
    }
    const data = {
        ...baseData,
        ...optionalData
    }
    const postURL = `${serverURL}/api/comment?lang=zh-CN`
    await options(postURL, 'POST')
    const res = await fetch(postURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    const resData = await res.json()

    return resData
}