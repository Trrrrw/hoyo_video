// 更新时间
let cachedUpdateTime: string | null = null
let pendingUpdateTimePromise: Promise<string> | null = null
export const fetchUpdateTime = async (): Promise<string> => {
    if (cachedUpdateTime) return cachedUpdateTime
    if (pendingUpdateTimePromise) return pendingUpdateTimePromise
    pendingUpdateTimePromise = (async () => {
        try {
            const res = await fetch('/api/update_time')
            const data: string = await res.json()
            cachedUpdateTime = data
            return data
        } finally {
            pendingUpdateTimePromise = null
        }
    })()
    return pendingUpdateTimePromise
}

// 游戏信息
export interface GameInfo {
    name: string
    weight: number
    news_detail_url: string
}

let cachedGameList: GameInfo[] | null = null
let pendingGameListPromise: Promise<GameInfo[]> | null = null

export const fetchGameList = async (): Promise<GameInfo[]> => {
    if (cachedGameList) return cachedGameList
    if (pendingGameListPromise) return pendingGameListPromise

    pendingGameListPromise = (async () => {
        try {
            const res = await fetch('/api/game/list')
            const data: GameInfo[] = await res.json()
            cachedGameList = data
            return data
        } finally {
            // 无论成功或失败，都清理 pending（如果失败，下次调用会重试）
            pendingGameListPromise = null
        }
    })()

    return pendingGameListPromise
}

// 分类信息
export interface TypeInfo {
    type_name: string
    cover: string
}
let cachedTypeList: Record<string, TypeInfo[]> = {}
let pendingTypeListPromise: Record<string, Promise<TypeInfo[]> | null> = {}

export const fetchTypeList = async (game: string): Promise<TypeInfo[]> => {
    if (cachedTypeList[game]) return cachedTypeList[game]
    if (pendingTypeListPromise[game]) return pendingTypeListPromise[game]!

    pendingTypeListPromise[game] = (async () => {
        try {
            const params = new URLSearchParams()
            params.append('game', game)
            const res = await fetch('/api/game/type/list?' + params.toString())
            const data: TypeInfo[] = await res.json()
            cachedTypeList[game] = data
            return data
        } finally {
            // 无论成功或失败，都清理 pending（如果失败，下次调用会重试）
            pendingTypeListPromise[game] = null
        }
    })()

    return pendingTypeListPromise[game]!
}

// 分类下的视频列表
export interface VideoInfo {
    id: number
    title: string
    time: string
    type: string[]
    src: string
    cover: string
    intro: string
    game: string
    play_count?: number
}

let cachedVideoList: Record<string, Record<string, Record<string, VideoInfo[]>>> = {}
let pendingVideoListPromise: Record<string, Record<string, Record<string, Promise<VideoInfo[]> | null>>> = {}
let cachedVideoCount: Record<string, Record<string, number>> = {}
let pendingVideoCountPromise: Record<string, Record<string, Promise<number> | null>> = {}

export interface VideoListResult {
    total: number
    video_list: VideoInfo[]
}

export const fetchVideoList = async (
    game: string,
    type: string,
    page: number = 1,
    pageSize: number = 20,
    all: boolean = false
): Promise<VideoListResult> => {
    const key = `${page}_${pageSize}_${all}`

    // ✅ 缓存命中
    if (cachedVideoList[game]?.[type]?.[key] && cachedVideoCount[game]?.[type] !== undefined) {
        return {
            total: cachedVideoCount[game][type],
            video_list: cachedVideoList[game][type][key]!
        }
    }

    // ✅ 正在请求中，直接复用 pending
    if (pendingVideoListPromise[game]?.[type]?.[key]) {
        const [total, video_list] = await Promise.all([
            pendingVideoCountPromise[game]![type]!,
            pendingVideoListPromise[game]![type]![key]!
        ])
        return { total, video_list }
    }

    // ✅ 初始化容器
    pendingVideoListPromise[game] ??= {}
    pendingVideoListPromise[game][type] ??= {}
    pendingVideoCountPromise[game] ??= {}

    // ✅ 构造请求
    const fetchPromise: Promise<VideoListResult> = (async () => {
        try {
            const params = new URLSearchParams()
            params.append('game', game)
            params.append('type', type)
            params.append('page', page.toString())
            params.append('page_size', pageSize.toString())
            params.append('all', all ? 'true' : 'false')

            const res = await fetch('/api/game/video/list?' + params.toString())
            const data = await res.json()

            const video_list: VideoInfo[] = data.videos
            const total: number = data.total

            // ✅ 缓存结果
            cachedVideoList[game] ??= {}
            cachedVideoList[game][type] ??= {}
            cachedVideoList[game][type][key] = video_list

            cachedVideoCount[game] ??= {}
            cachedVideoCount[game][type] = total

            return { total, video_list }
        } finally {
            // 清理 pending
            if (pendingVideoListPromise[game] && pendingVideoListPromise[game][type]) {
                pendingVideoListPromise[game][type][key] = null
            }
            if (pendingVideoCountPromise[game]) {
                pendingVideoCountPromise[game][type] = null
            }
        }
    })()

    // ✅ 挂上 pending promise
    pendingVideoListPromise[game][type][key] = fetchPromise.then(r => r.video_list)
    pendingVideoCountPromise[game][type] = fetchPromise.then(r => r.total)

    return fetchPromise
}

// 搜索视频
let cachedSearchResult: Record<string, Record<string, VideoInfo[]>> = {}
let pendingSearchResultPromise: Record<string, Record<string, Promise<VideoInfo[]> | null>> = {}
export const searchVideos = async (game: string, q: string): Promise<VideoInfo[]> => {
    if (cachedSearchResult[game]?.[q]) return cachedSearchResult[game]?.[q]
    if (pendingSearchResultPromise[game]?.[q]) return pendingSearchResultPromise[game]?.[q]!

    // 初始化容器
    if (!pendingSearchResultPromise[game]) {
        pendingSearchResultPromise[game] = {}
    }
    pendingSearchResultPromise[game][q] = (async () => {
        try {
            const params = new URLSearchParams()
            params.append('game', game)
            params.append('q', q)
            const res = await fetch('/api/game/video/search?' + params.toString())
            const data: VideoInfo[] = (await res.json()).videos
            cachedSearchResult[game] ??= {}
            cachedSearchResult[game][q] = data
            return data
        } finally {
            if (pendingSearchResultPromise[game]) {
                pendingSearchResultPromise[game][q] = null
            }
        }
    })()

    return pendingSearchResultPromise[game]?.[q]!
}

// 获取视频信息
let cachedVideoData: Record<string, Record<number, VideoInfo>> = {}
let pendingVideoDataPromise: Record<string, Record<number, Promise<VideoInfo> | null>> = {}
export const fetchVideoData = async (id: number, game: string): Promise<VideoInfo> => {
    if (cachedVideoData[game]?.[id]) return cachedVideoData[game][id]
    if (pendingVideoDataPromise[game]?.[id]) return pendingVideoDataPromise[game][id]
    pendingVideoDataPromise[game] ??= {}
    pendingVideoDataPromise[game][id] = (async () => {
        try {
            const params = new URLSearchParams()
            params.append('game', game)
            params.append('video_id', id.toString())
            const res = await fetch('/api/game/video/info?' + params.toString())
            const data: VideoInfo = await res.json()
            cachedVideoData[game] ??= {}
            cachedVideoData[game][id] = data
            return data
        } finally {
            if (pendingVideoDataPromise[game])
                pendingVideoDataPromise[game][id] = null
        }
    })()
    return pendingVideoDataPromise[game]?.[id]!
}

// Umami 统计数据
export interface ViewsData {
    views: number
    visitors: number
    visits: number
}
let cachedViewsData: ViewsData | null = null
let pendingViewsDataPromise: Promise<ViewsData> | null = null
export interface ChartData {
    chartLabels: string[]
    visitorDatasets: number[]
    visitDatasets: number[]
}
let cachedChartData: ChartData | null = null
let pendingChartDataPromise: Promise<ChartData> | null = null
export const fetchUmamiData = async (): Promise<[ViewsData, ChartData]> => {
    if (cachedViewsData && cachedChartData) return [cachedViewsData, cachedChartData]
    if (pendingViewsDataPromise && pendingChartDataPromise) {
        const [viewsData, chartData] = await Promise.all([pendingViewsDataPromise, pendingChartDataPromise])
        return [viewsData, chartData]
    }

    // 获取当前日期的23:59:59的时间戳
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    // 获取7天前的日期的00:00:00的时间戳
    const startOf7DaysAgo = new Date(endOfDay)
    startOf7DaysAgo.setDate(startOf7DaysAgo.getDate() - 6)
    startOf7DaysAgo.setHours(0, 0, 0, 0)
    // 转换为时间戳（毫秒）
    const endAt = endOfDay.getTime()
    const startAt = startOf7DaysAgo.getTime()

    const headers = {
        'authorization': 'Bearer xQsc18bnNkUpWk3JGdYv6Aex4hjftuD5VW7b9O4jNx5Q1x928T9JqyhkUsqn8+HvblkGvjmWS3FgfCqvqIw5cYsoyo4rdpoxVcE5ie3pYTVO5dPEb2pX8ZIZS2hyMO7o/DoXEBC8J20KbxbWUUUX2MarBsY3+38GNc8sbDsMWgG+SPQEgF6pJ4njKu7SEeypAsmj/sA8vRYkHf/h1KIzr0VJ4yXYLCr0h7DOVjX6/Wp7FeD/ZmqEExs55Q+hQ8D8bq/3bNe9aONGqQa8RwpzIuZXdqgc9ejQs2T0VT3z+zf+bQcKZGE/0fNMdIiFVaG/EReiUvqr5NooxrmplLJnDCZUZMCNuUw15BS/kxXtQPyqpRuESFZFK3C4SA9i',
        'cookie': '_clck=fgs6kc%7C2%7Cfva%7C0%7C1938; cf_clearance=ixOAvmzI16FnGHas3KZg7x16oXsmMNlIn7MaMyaSRF8-1750647801-1.2.1.1-net_AWx9MPuBiAH5oVFz.LeOJUyPTKkDrC46c4zY8VzOLGvQqQU9Gl8oXjPs1eSQn6pYuDNtC4dWH.hA71fX_2AGuia2mnqQfQ_QQuQJ__KqnmDJqF9eeAatAe8kOnkkiPiPU.Oo8xTpvB7fkb_nVzF24QIAAmg6O3u97xQRNCQU_5CAm.v._EzMpWqroVu0Xtg_ZpPYZpkm.1qGk_9uOLVktEVaHKOzV4PxnYmlfJ1t6nmoOWzufhatyqenncYClgXhPLaK5hbkLiyr31u_gR8j4A_DIqtUAka5n7JBKtsTKVgVYAbsKFpsVkVKVuC53IpfUQoQCSDfmJ.oKnsQ7Hj9uIGxuSGUSC72EuiAmhs'
    }
    pendingViewsDataPromise = (async () => {
        try {
            const viewsDataRes = await fetch(`https://umami.trrw.tech/api/websites/4f5de7ac-459b-4481-8011-5c27fc8759a3/stats?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=Asia%2FShanghai&compare=false`, { headers: headers })
            const viewsData = await viewsDataRes.json()
            cachedViewsData = {
                views: viewsData.pageviews.value,
                visitors: viewsData.visitors.value,
                visits: viewsData.visits.value
            }
            return cachedViewsData
        } finally {
            pendingViewsDataPromise = null
        }
    })()
    pendingChartDataPromise = (async () => {
        try {
            const chartDataRes = await fetch(`https://umami.trrw.tech/api/websites/4f5de7ac-459b-4481-8011-5c27fc8759a3/pageviews?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=Asia%2FShanghai`, { headers: headers })
            interface ChartData {
                pageviews: ChartDataPoint[]
                sessions: ChartDataPoint[]
            }
            interface ChartDataPoint {
                x: string
                y: number
            }
            const charData: ChartData = await chartDataRes.json()
            cachedChartData = {
                chartLabels: charData.sessions.map(item => item.x.replace(/^\d{4}-(\d{2}-\d{2}).*$/, '$1')),
                visitorDatasets: charData.sessions.map(item => item.y),
                visitDatasets: charData.pageviews.map(item => item.y)
            }
            return cachedChartData
        } finally {
            pendingChartDataPromise = null
        }
    })()
    const [viewsData, chartData] = await Promise.all([pendingViewsDataPromise, pendingChartDataPromise])
    return [viewsData, chartData]
}


// 播放量 批量
export const fetchVideoPlayCountList = async (video_info_list: VideoInfo[]) => {
    // 按 game 分组
    const gameMap = new Map<string, number[]>()
    for (const video of video_info_list) {
        if (!video.game) continue
        if (!gameMap.has(video.game)) {
            gameMap.set(video.game, [])
        }
        gameMap.get(video.game)!.push(video.id)
    }
    // 并发调用每个游戏的接口
    const promises = Array.from(gameMap.entries()).map(async ([game, ids]) => {
        return getOneGameVideoPlayCountList(game, ids)
    })
    // 等待所有请求完成
    const results = await Promise.all(promises)

    results.forEach((data, idx) => {
        const entry = Array.from(gameMap.entries())[idx]
        if (!entry) return

        const [game, ids] = entry
        ids.forEach(id => {
            const video = video_info_list.find(v => v.id === id && v.game === game)
            if (video && data[id] !== undefined) {
                video.play_count = data[id]
            }
        })
    })
}

let cachedVideoPlayCount: Record<string, number> = {}
let pendingVideoPlayCountPromise: Record<string, Promise<number> | null> = {}
const getOneGameVideoPlayCountList = async (game: string, ids: number[]): Promise<Record<string, number>> => {
    const results = new Map<string, number>()
    const id_to_search: number[] = []
    // ✅ 遍历所有 ID，先尝试用缓存或 pending
    for (const id of ids) {
        const key = `${game}_${id}`
        results.set(id.toString(), 0)
        if (cachedVideoPlayCount[key] !== undefined) {
            results.set(id.toString(), cachedVideoPlayCount[key])
        } else if (pendingVideoPlayCountPromise[key]) {
            const value = await pendingVideoPlayCountPromise[key]!
            results.set(id.toString(), value)
        } else {
            id_to_search.push(id)
        }
    }
    // ✅ 没有需要请求的就直接返回
    if (id_to_search.length === 0) {
        return Object.fromEntries(results)
    }

    const params = new URLSearchParams()
    params.append('game', game)
    params.append('video_ids', id_to_search.join(','))
    // ✅ 对整个 game+ids 组合设置 pending 状态（去重）
    const batchKey = `${game}_${id_to_search.join(',')}`
    pendingVideoPlayCountPromise[batchKey] = (async () => {
        try {
            const res = await fetch('/api/game/video/count?' + params.toString())
            const data: Record<string, number> = await res.json()
            // 更新缓存
            for (const [idStr, count] of Object.entries(data)) {
                const key = `${game}_${idStr}`
                cachedVideoPlayCount[key] = count
                results.set(idStr, count)
            }
            return 0 // dummy，只是让 promise resolve
        } finally {
            pendingVideoPlayCountPromise[batchKey] = null
        }
    })()
    // ✅ 等待请求完成
    await pendingVideoPlayCountPromise[batchKey]
    // ✅ 返回结果
    return Object.fromEntries(results)
}