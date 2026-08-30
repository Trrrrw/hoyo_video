import type { NewsInfo } from "../api/types";

export type EmbeddedVideo = {
  platformName: string;
  embedUrl: string;
};

const youtubeVideoIdPattern = /^[\w-]{11}$/;

function getYouTubeVideoId(url: URL): string | null {
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

  if (hostname === "youtu.be") {
    const videoId = url.pathname.split("/").filter(Boolean)[0];
    return videoId && youtubeVideoIdPattern.test(videoId) ? videoId : null;
  }

  if (
    hostname !== "youtube.com" &&
    hostname !== "m.youtube.com" &&
    hostname !== "music.youtube.com" &&
    hostname !== "youtube-nocookie.com"
  ) {
    return null;
  }

  const pathSegments = url.pathname.split("/").filter(Boolean);
  const videoId =
    url.pathname === "/watch"
      ? url.searchParams.get("v")
      : ["embed", "shorts", "live"].includes(pathSegments[0] ?? "")
        ? pathSegments[1]
        : null;

  return videoId && youtubeVideoIdPattern.test(videoId) ? videoId : null;
}

export function getEmbeddedVideo(urlValue: string | null): EmbeddedVideo | null {
  if (!urlValue) return null;

  try {
    const videoId = getYouTubeVideoId(new URL(urlValue));
    if (!videoId) return null;

    return {
      platformName: "YouTube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
    };
  } catch {
    return null;
  }
}

export function isEmbeddedPlayback(news: NewsInfo): boolean {
  return news.video_playback === "embed";
}
