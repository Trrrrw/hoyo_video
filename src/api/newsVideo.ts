import { backendFetch } from "./client";
import { isNewsVideoResponse, parseJson } from "./parsers";

export type NewsVideo = {
  video_url: string;
};

type NewsVideoResponse = {
  video_url: string;
};

export async function fetchNewsVideo(
  gameId: string,
  newsId: string,
  sourceId: string,
): Promise<NewsVideo> {
  const response = await backendFetch(
    `/api/v1/games/${encodeURIComponent(gameId)}/news/${encodeURIComponent(newsId)}/media/video`,
    { source: sourceId },
  );
  const data = await parseJson<NewsVideoResponse>(
    response,
    isNewsVideoResponse,
    "视频地址",
  );

  if (!data.video_url) {
    throw new Error("视频链接为空");
  }

  return {
    video_url: data.video_url,
  };
}
