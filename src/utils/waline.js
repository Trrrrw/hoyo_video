export const getCommentList = async (path, page, pageSize, sortBy) => {
    // Get请求
    const params = new URLSearchParams({
        path,
        page,
        pageSize,
        sortBy
    })
    const url = `https://video-waline.trrw.tech/api/comment?${params.toString()}`
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
    const res = await fetch('https://video-waline.trrw.tech/api/comment', { method: 'POST', body: JSON.stringify(data) })
    const resData = await res.json()

    return resData
}