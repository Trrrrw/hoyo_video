/** URL 查询参数的通用键值类型 */
export type QueryParams = Record<
  string,
  string | number | boolean | undefined | null
>;

/** 后端列表接口的最小响应结构 */
export type ListResponse<T> = {
  total: number;
  items: T[];
};

/** 后端分页接口的通用响应结构 */
export type PageResponse<T, Meta> = ListResponse<T> & {
  limit: number;
  offset: number;
  meta: Meta;
};

export type NewsCount = {
  total: number;
  article: number;
  video: number;
};

export type GameInfo = {
  id: string;
  name: string;
  index: number;
  cover: string | null;
  icon: string | null;
  news_count: NewsCount;
  recent_news: RecentNews;
};

export type NewsCharacter = {
  id: string;
  item_id: string;
  name: string;
};

export type NewsInfo = {
  id: string;
  source_id: string;
  title: string;
  source_url: string;
  news_type: string;
  tags: string[];
  characters: NewsCharacter[];
  cover: string | null;
  intro: string | null;
  publish_time: string | null;
  video_url: string | null;
  video_duration: number | null;
};

export type RelatedVideoInfo = Pick<
  NewsInfo,
  | "id"
  | "source_id"
  | "title"
  | "publish_time"
  | "cover"
  | "video_duration"
  | "tags"
  | "characters"
>;

export type NewsDetailInfo = NewsInfo & {
  related_videos: RelatedVideoInfo[];
};

export type RecentNews = {
  article: NewsInfo[];
  video: NewsInfo[];
};

export type NewsSourceInfo = {
  id: string;
  name: string;
  index: number;
};

export type TagInfo = {
  name: string;
  index: number;
  news_count: NewsCount;
  recent: RecentNews;
};

export type TagGroupInfo = {
  name: string | null;
  index: number | null;
  tags: TagInfo[];
};

export type TagsResponse = {
  game_id: string;
  source_id: string;
  groups: TagGroupInfo[];
};
