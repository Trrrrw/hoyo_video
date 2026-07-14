import { fetchWithCache } from './apiCache';

// --- 类型定义 ---
interface UpdateTimeResponse {
    update_time: string;
}
export interface GameInfo {
    name: string;
    weight: number;
    news_detail_url: string;
}
interface GameListResponse {
    total: number;
    items: GameInfo[];
}
export interface TypeInfo {
    type_name: string;
    cover: string;
}
interface TypeListResponse {
    total: number;
    items: TypeInfo[];
}
export interface VideoInfo {
    id: number;
    title: string;
    time: string;
    type: string[];
    src: string;
    cover: string;
    intro: string;
    game: string;
    play_count?: number;
}
export interface VideoListResponse {
    total: number;
    items: VideoInfo[];
}
export interface ViewsData {
    views: number;
    visitors: number;
    visits: number;
}
export interface ChartData {
    chartLabels: string[];
    visitorDatasets: number[];
    visitDatasets: number[];
}

// --- 具体的 API 函数 ---
/**
 * 获取更新时间
 * @returns {Promise<string>} 更新时间字符串 YYYY-MM-DD HH:MM:SS
 */
export const fetchUpdateTime = (): Promise<string> => {
    const path = '/api/update_time';
    return fetchWithCache<string>(path, async () => {
        const res = await fetch(path);
        const data: UpdateTimeResponse = await res.json();
        return data.update_time;
    });
}

/**
 * 获取游戏列表
 * @returns {Promise<GameInfo[]>} 游戏列表
 */
export const fetchGameList = (): Promise<GameInfo[]> => {
    const path = '/api/games';
    return fetchWithCache<GameInfo[]>(path, async () => {
        const res = await fetch(path);
        const data: GameListResponse = await res.json();
        return data.items;
    });
}

/**
 * 获取分类信息
 * @param {string} game 游戏名称
 * @returns {Promise<TypeInfo[]>} 分类信息列表
 */
export const fetchTypeList = (game: string): Promise<TypeInfo[]> => {
    const path = `/api/${game}/types`
    return fetchWithCache<TypeInfo[]>(path, async () => {
        const res = await fetch(path);
        const data: TypeListResponse = await res.json();
        return data.items;
    });
}

/**
 * 获取视频列表
 * @param {string} game 游戏名称
 * @param {string} type 分类名称
 * @param {number} page 页码
 * @param {number} pageSize 每页视频数
 * @param {boolean} all 是否返回全部视频
 * @returns {Promise<VideoListResponse>} 视频列表信息
 */
export const fetchVideoList = (
    game: string,
    type: string,
    page: number = 1,
    pageSize: number = 20,
    all: boolean = false,
): Promise<VideoListResponse> => {
    const params = new URLSearchParams({
        type: type,
        page: String(page),
        page_size: String(pageSize),
        all: String(all)
    });
    const fullUrl = `/api/${game}/videos?${params.toString()}`;
    return fetchWithCache<VideoListResponse>(fullUrl, async () => {
        const res = await fetch(fullUrl);
        return res.json();
    });
}

/**
 * 获取视频详细信息
 * @param {number} id 视频ID
 * @param {string} game 游戏名称
 * @returns {Promise<VideoInfo>} 视频信息
 */
export const fetchVideoData = (id: number, game: string): Promise<VideoInfo> => {
    const path = `/api/${game}/videos/${id}`;
    return fetchWithCache<VideoInfo>(path, async () => {
        const res = await fetch(path);
        return res.json();
    });
}

/**
 * 搜索视频
 * @param {string} game 游戏名称
 * @param {string} q 搜索关键词
 * @returns {Promise<VideoInfo[]>} 视频列表
 */
export const searchVideos = (game: string, q: string): Promise<VideoInfo[]> => {
    const params = new URLSearchParams({
        q: q,
        game: game
    });
    const fullUrl = `/api/search?${params.toString()}`;
    return fetchWithCache<VideoInfo[]>(fullUrl, async () => {
        const res = await fetch(fullUrl);
        const data: VideoListResponse = await res.json();
        return data.items;
    });
}

/**
 * 补全视频信息中的播放量
 * @param {VideoInfo[]} video_info_list 视频列表
 */
export const fetchVideoPlayCount = async (video_info_list: VideoInfo[]): Promise<void> => {
    const path = '/api/videos/play-count';
    const keys: string[] = video_info_list.map(
        video_info => `${video_info.game}_${video_info.id}`
    );
    const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'get',
            keys: keys
        })
    });
    if (!res.ok) {
        throw new Error('Failed to fetch play counts');
    }
    const play_count_map: Record<string, number> = await res.json();
    video_info_list.forEach(video_info => {
        const key = `${video_info.game}_${video_info.id}`;
        video_info.play_count = play_count_map[key] ?? 0;
    });
}

/**
 * 增加视频播放量
 * @param {VideoInfo[]} video_info_list 视频列表
 */
export const increaseVideoPlayCount = async (video_info_list: VideoInfo[]): Promise<void> => {
    const path = '/api/videos/play-count';
    const keys: string[] = video_info_list.map(
        video_info => `${video_info.game}_${video_info.id}`
    );
    await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'increase',
            keys: keys
        })
    });
}

// Umami 统计数据 [TODO]
let cachedViewsData: ViewsData | null = null
let pendingViewsDataPromise: Promise<ViewsData> | null = null
let cachedChartData: ChartData | null = null
let pendingChartDataPromise: Promise<ChartData> | null = null
let cachedActiveData: number | null = null
let pendingActiveDataPromise: Promise<number> | null = null
export const fetchUmamiData = async (): Promise<[ViewsData, ChartData, number]> => {
    if (cachedViewsData && cachedChartData && cachedActiveData) return [cachedViewsData, cachedChartData, cachedActiveData]
    if (pendingViewsDataPromise && pendingChartDataPromise && pendingActiveDataPromise) {
        const [viewsData, chartData, activeData] = await Promise.all([pendingViewsDataPromise, pendingChartDataPromise, pendingActiveDataPromise])
        return [viewsData, chartData, activeData]
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
      'x-umami-share-context': 1,
      'x-umami-share-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaGFyZUlkIjoiYjA4MDcwYWUtYWJmZS00YjA5LTlkYTAtMmYxOWZiMGQxZWE5Iiwic2hhcmVUeXBlIjoxLCJwYXJhbWV0ZXJzIjp7InV0bSI6ZmFsc2UsImdvYWxzIjpmYWxzZSwiZXZlbnRzIjp0cnVlLCJjb21wYXJlIjpmYWxzZSwiZnVubmVscyI6ZmFsc2UsInJldmVudWUiOmZhbHNlLCJqb3VybmV5cyI6ZmFsc2UsIm92ZXJ2aWV3Ijp0cnVlLCJyZWFsdGltZSI6dHJ1ZSwic2Vzc2lvbnMiOnRydWUsImJyZWFrZG93biI6ZmFsc2UsInJldGVudGlvbiI6ZmFsc2UsImFsbG93RmlsdGVyIjp0cnVlLCJhdHRyaWJ1dGlvbiI6ZmFsc2UsInBlcmZvcm1hbmNlIjpmYWxzZX0sIndlYnNpdGVJZCI6IjE5NTEwMGZlLTA5NjEtNDkwNi05ZmMyLTA4NDgzM2MzMGU2NSIsInR5cGUiOiJzaGFyZSIsImlhdCI6MTc4Mzk5NjAwMn0.0dRN_E-aji--y6BV9Rff1X9cV0jO9njvaTJ78T_aujw'
    }
    pendingViewsDataPromise = (async () => {
        try {
            const viewsDataRes = await fetch(`https://umami.trrw.tech/api/websites/195100fe-0961-4906-9fc2-084833c30e65/stats?startAt=${startAt}&endAt=${endAt}&page=1`, { headers: headers })
            const viewsData = await viewsDataRes.json()
            cachedViewsData = {
                views: viewsData.pageviews,
                visitors: viewsData.visitors,
                visits: viewsData.visits
            }
            return cachedViewsData
        } finally {
            pendingViewsDataPromise = null
        }
    })()
    pendingChartDataPromise = (async () => {
        try {
            const chartDataRes = await fetch(`https://umami.trrw.tech/api/websites/195100fe-0961-4906-9fc2-084833c30e65/pageviews?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=Asia%2FShanghai&page=1`, { headers: headers })
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
  pendingActiveDataPromise = (async () => {
    try {
      const activeDataRes = await fetch(`https://umami.trrw.tech/api/websites/195100fe-0961-4906-9fc2-084833c30e65/active`, { headers: headers })
      const avtiveData: { visitors: number } = await activeDataRes.json()
      cachedActiveData = avtiveData.visitors
      return cachedActiveData
    } finally {
      pendingActiveDataPromise = null
    }
    })()
    const [viewsData, chartData, activeData] = await Promise.all([pendingViewsDataPromise, pendingChartDataPromise, pendingActiveDataPromise])
    return [viewsData, chartData, activeData]
}
