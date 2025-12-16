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
        'authorization': 'Bearer zoF32eaXAyPS2673KpK6rH4Qv6Qw1YuubYWKLt/3D0nI6wSCDC7aWTHJNlFAlmasWv4XEWwxXLhhz79ReBu8YRmSoq2NNN5dXdewKqGXnWRqjbDhuV2zKGG7KjzbDN6cXXee7Sg/ttm4ih5lc68PaYCUOALT8P1XhKYHrxttpnw+w8Pnf8OoATbYK8B6NtSVUq6/6yjdKup9zyCjjUE+YWJmV6E+eKRiZ0wrw1WGRNtfNYe+N4PtVc4zCr8v9q73uJfBIljeGWqjuLfLTYiVYYDGC5g8A5yjUKmjlGnWkvaluuEWthueuoO5eTcgx0sO4UIHB/YGzbIvA/5RVNQ4pw2ZnQ38fHdF211pPHv4SXvIGE6zHVhiIDDnYaJy',
        'cookie': 'rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX1%2FQFsU%2FyxPfw1sti7TLqGJlMDbRvouzULI%3D; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX1%2FS5aBDxxMG9%2B3tLjOMttsNWl0LYov2nkU%3D; ph_phc_4URIAm1uYfJO7j8kWSe0J8lc8IqnstRLS7Jx8NcakHo_posthog=%7B%22distinct_id%22%3A%229d7d4b2ab6ac7c4d3182368f718b81835361860961cad4ac4422a274cb6e3313%23a7acb562-86f4-48d7-a7dc-2a08333ddee7%22%2C%22%24sesid%22%3A%5B1760623244295%2C%220199ed52-b408-7090-b178-9168798c64df%22%2C1760623244295%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22http%3A%2F%2Ffn.trrw.tech%3A5678%2Fhome%2Fworkflows%22%7D%7D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX1%2B%2F0zfQtow53oKxBLS4PnF7AQzPXtXJ9LImvtMegHKjJq0Eb6qn0CMWphDUmsRbYhFiTa%2Be8tijGg%3D%3D; rl_user_id=RudderEncrypt%3AU2FsdGVkX19eJUm9r7N9ATQ00x%2F6TLmNNAwy6LEX5G01HEss%2BfAet0wQ%2Bx7FJfC1a7QLwyTPNmelB9reRNCJ95fENlt9JXiilFGCZHFsfnfvp5yqlbXzXBFJdkHrYbuvaftLLq5GxOHTsZBmVaxH98JSMeJ4AbfCeWeGBIW76DU%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX1%2BoEN3pkfpt6AcDSpJqvR0JLb7RZ7OuZThButuex3M%2Bd2GypkNkpb2W1yDo5kuC2TBtfoamYi5xMCzrWIXgt2n9MAPC53jf9zeByXiekEW4O5ZcuB8T%2FP6l887RGXyBlRtITh1BZLqgM0TQ6ajuTTvL4i6Xpdv%2Fg4s%3D; rl_session=RudderEncrypt%3AU2FsdGVkX19mG2qzqnLKsswJvs2rSu2OoxS%2FHs9wv%2F0hc1VWLgWx3wiS7ObpSYMNDxW3pkJKcUCp7DIgWSH%2FUokIHtNZM2rlnKISDJnJETsYP%2FZ312xx7uTH4UFOrvBcv9w3Jn7c5NPaETGZvGokMQ%3D%3D'
    }
    pendingViewsDataPromise = (async () => {
        try {
            const viewsDataRes = await fetch(`https://umami.trrw.tech/api/websites/4f5de7ac-459b-4481-8011-5c27fc8759a3/stats?startAt=${startAt}&endAt=${endAt}&unit=day&timezone=Asia%2FShanghai&compare=false`, { headers: headers })
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
