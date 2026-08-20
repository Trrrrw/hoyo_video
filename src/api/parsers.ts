import { BackendError } from "./client";
import type {
  GameDataEntry,
  GameInfo,
  ListResponse,
  NewsCharacter,
  NewsCount,
  NewsDetailInfo,
  NewsInfo,
  NewsSourceInfo,
  PageResponse,
  RecentNews,
  RelatedVideoInfo,
  TagGroupInfo,
  TagInfo,
  TagsResponse,
  UntaggedInfo,
} from "./types";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNumber(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isNewsCount(value: unknown): value is NewsCount {
  return (
    isRecord(value) &&
    isNumber(value.total) &&
    isNumber(value.article) &&
    isNumber(value.video)
  );
}

function isNewsCharacter(value: unknown): value is NewsCharacter {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name)
  );
}

export function isNewsInfo(value: unknown): value is NewsInfo {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.source) &&
    isString(value.title) &&
    isString(value.source_url) &&
    isString(value.news_type) &&
    isStringArray(value.tags) &&
    Array.isArray(value.characters) &&
    value.characters.every(isNewsCharacter) &&
    isNullableString(value.cover) &&
    isNullableString(value.intro) &&
    isNullableString(value.publish_time) &&
    isNullableString(value.video_url) &&
    isNullableNumber(value.video_duration)
  );
}

function isRelatedVideoInfo(value: unknown): value is RelatedVideoInfo {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.source) &&
    isString(value.title) &&
    isNullableString(value.publish_time) &&
    isNullableString(value.cover) &&
    isNullableNumber(value.video_duration) &&
    isStringArray(value.tags) &&
    Array.isArray(value.characters) &&
    value.characters.every(isNewsCharacter)
  );
}

export function isNewsDetailInfo(value: unknown): value is NewsDetailInfo {
  if (!isNewsInfo(value)) return false;

  const relatedVideos = (value as RecordValue).related_videos;
  return Array.isArray(relatedVideos) && relatedVideos.every(isRelatedVideoInfo);
}

function isRecentNews(value: unknown): value is RecentNews {
  return (
    isRecord(value) &&
    Array.isArray(value.article) &&
    value.article.every(isNewsInfo) &&
    Array.isArray(value.video) &&
    value.video.every(isNewsInfo)
  );
}

export function isGameInfo(value: unknown): value is GameInfo {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isNumber(value.index) &&
    isNullableString(value.cover) &&
    isNullableString(value.icon) &&
    isNewsCount(value.news_count) &&
    isRecentNews(value.recent_news)
  );
}

function isGameDataEntry(value: unknown): value is GameDataEntry {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isNullableString(value.name) &&
    isNullableString(value.icon)
  );
}

export function isGameDataPage(
  value: unknown,
): value is PageResponse<GameDataEntry, unknown> {
  return isPageResponse(
    value,
    isGameDataEntry,
    (_meta: unknown): _meta is unknown => true,
  );
}

export function isNewsSourceInfo(value: unknown): value is NewsSourceInfo {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isNumber(value.index)
  );
}

function isTagInfo(value: unknown): value is TagInfo {
  return (
    isRecord(value) &&
    isString(value.name) &&
    isNumber(value.index) &&
    isNewsCount(value.news_count) &&
    isRecentNews(value.recent)
  );
}

function isTagGroupInfo(value: unknown): value is TagGroupInfo {
  return (
    isRecord(value) &&
    isNullableString(value.name) &&
    isNullableNumber(value.index) &&
    Array.isArray(value.tags) &&
    value.tags.every(isTagInfo)
  );
}

function isUntaggedInfo(value: unknown): value is UntaggedInfo {
  return (
    isRecord(value) &&
    isNewsCount(value.news_count) &&
    isRecentNews(value.recent)
  );
}

export function isTagsResponse(value: unknown): value is TagsResponse {
  return (
    isRecord(value) &&
    isString(value.game_id) &&
    isString(value.source) &&
    Array.isArray(value.groups) &&
    value.groups.every(isTagGroupInfo) &&
    isUntaggedInfo(value.untagged)
  );
}

export function isListResponse<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T,
): value is ListResponse<T> {
  return (
    isRecord(value) &&
    isNumber(value.total) &&
    Array.isArray(value.items) &&
    value.items.every(itemGuard)
  );
}

export function isPageResponse<T, Meta>(
  value: unknown,
  itemGuard: (item: unknown) => item is T,
  metaGuard: (meta: unknown) => meta is Meta,
): value is PageResponse<T, Meta> {
  if (!isListResponse(value, itemGuard)) return false;

  const page = value as RecordValue & PageResponse<T, Meta>;
  return isNumber(page.limit) && isNumber(page.offset) && metaGuard(page.meta);
}

export function isNewsVideoResponse(
  value: unknown,
): value is { video_url: string | null } {
  return isRecord(value) && isNullableString(value.video_url);
}

export async function parseJson<T>(
  response: Response,
  guard: (value: unknown) => value is T,
  resourceName: string,
): Promise<T> {
  let value: unknown;

  try {
    value = await response.json();
  } catch {
    throw new BackendError(0, `${resourceName}数据解析失败`);
  }

  if (!guard(value)) {
    throw new BackendError(0, `${resourceName}数据格式错误`);
  }

  return value;
}
