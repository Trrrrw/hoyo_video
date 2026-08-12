import "@videojs/react/video/skin.css";
import {
  BufferingIndicator,
  createPlayer,
  Poster,
  selectControls,
  selectPlayback,
  selectQuality,
  selectSource,
  selectTime,
  useContainer,
  usePlayer,
  videoFeatures,
} from "@videojs/react";
import { SpinnerIcon } from "@videojs/react/icons";
import { VideoSkin, Video } from "@videojs/react/video";
import {
  IconArrowLeft,
  IconDownload,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconLink,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NewsInfo } from "../api/types";
import DownloadVideoModal from "./DownloadVideoModal";
import "./VideoPlayer.css";

const Player = createPlayer({ features: videoFeatures });

type VideoPlayerProps = {
  news: NewsInfo;
  gameId: string;
  gameName: string;
  onBack: () => void;
};

function VideoPlayerNavigation({
  onBack,
  sourceUrl,
}: {
  onBack: () => void;
  sourceUrl: string;
}) {
  const controls = usePlayer(selectControls);
  const controlsVisible = controls?.controlsVisible ?? true;

  return (
    <div
      className="video-player-navigation"
      data-visible={controlsVisible ? "" : undefined}
      aria-label="视频操作"
    >
      <span className="video-player-navigation-surface media-surface">
        <button
          type="button"
          className="media-button media-button--subtle media-button--icon"
          aria-label="返回"
          title="返回"
          onClick={onBack}
        >
          <IconArrowLeft className="media-icon" aria-hidden="true" />
        </button>
      </span>
      <span className="video-player-navigation-surface media-surface">
        <a
          className="media-button media-button--subtle media-button--icon"
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="查看来源"
          title="查看来源"
        >
          <IconLink className="media-icon" aria-hidden="true" />
        </a>
      </span>
    </div>
  );
}

function VideoPlayerSpinner() {
  return (
    <span className="video-player-spinner media-surface">
      <SpinnerIcon className="media-icon" />
    </span>
  );
}

function VideoPlayerLoadingIndicator() {
  const source = usePlayer(selectSource);

  if (!source?.source || source.canPlay) return null;

  return (
    <div
      className="video-player-loading-indicator"
      role="status"
      aria-label="视频加载中"
    >
      <VideoPlayerSpinner />
    </div>
  );
}

function VideoPlayerCustomControls({ onDownload }: { onDownload: () => void }) {
  const container = useContainer();
  const playback = usePlayer(selectPlayback);
  const quality = usePlayer(selectQuality);
  const time = usePlayer(selectTime);
  const [controlGroups, setControlGroups] = useState<{
    left: HTMLElement;
    right: HTMLElement;
  } | null>(null);
  const frameRate = quality?.activeVideoRendition?.frameRate;
  const frameDuration =
    frameRate && Number.isFinite(frameRate) && frameRate > 0
      ? 1 / frameRate
      : 1 / 30;

  const seekFrame = (direction: -1 | 1) => {
    if (!time) return;

    playback?.pause();

    const currentTime = Number.isFinite(time.currentTime)
      ? time.currentTime
      : 0;
    const duration = Number.isFinite(time.duration) ? time.duration : Infinity;
    const targetTime = Math.min(
      Math.max(0, currentTime + direction * frameDuration),
      duration,
    );

    if (targetTime !== currentTime) {
      void time.seek(targetTime).catch(() => undefined);
    }
  };

  useEffect(() => {
    if (!container) {
      setControlGroups(null);
      return;
    }

    const findControlGroups = () => {
      const groups = container.querySelectorAll<HTMLElement>(
        ".media-controls .media-button-group",
      );
      if (groups.length < 2) return false;

      setControlGroups({
        left: groups[0]!,
        right: groups[groups.length - 1]!,
      });
      return true;
    };

    if (findControlGroups()) return;

    const observer = new MutationObserver(() => {
      if (findControlGroups()) observer.disconnect();
    });
    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [container]);

  if (!controlGroups) return null;

  return (
    <>
      {createPortal(
        <>
          <button
            type="button"
            className="media-button media-button--subtle media-button--icon"
            aria-label="上一帧"
            title="上一帧"
            onClick={() => seekFrame(-1)}
          >
            <IconPlayerTrackPrev className="media-icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="media-button media-button--subtle media-button--icon"
            aria-label="下一帧"
            title="下一帧"
            onClick={() => seekFrame(1)}
          >
            <IconPlayerTrackNext className="media-icon" aria-hidden="true" />
          </button>
        </>,
        controlGroups.left,
      )}
      {createPortal(
        <button
          type="button"
          className="video-player-download-control media-button media-button--subtle media-button--icon"
          aria-label="下载视频"
          title="下载视频"
          onClick={onDownload}
        >
          <IconDownload className="media-icon" aria-hidden="true" />
        </button>,
        controlGroups.right,
      )}
    </>
  );
}

export default function VideoPlayer({
  news,
  gameId,
  gameName,
  onBack,
}: VideoPlayerProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <Player.Provider>
      <VideoSkin className="video-player-skin aspect-video w-full overflow-hidden">
        <Poster src={news.cover ?? undefined} alt={news.title} />
        <Video
          src={news.video_url ?? undefined}
          playsInline
          autoPlay={!import.meta.env.DEV}
        />
        <VideoPlayerLoadingIndicator />
        <VideoPlayerNavigation onBack={onBack} sourceUrl={news.source_url} />
        <BufferingIndicator
          className="media-buffering-indicator"
          render={(props) => (
            <div {...props}>
              <VideoPlayerSpinner />
            </div>
          )}
        />
      <VideoPlayerCustomControls
        onDownload={() => setDownloadOpen(true)}
      />
      </VideoSkin>
      <DownloadVideoModal
        open={downloadOpen}
        news={news}
        gameId={gameId}
        gameName={gameName}
        videoUrl={news.video_url}
        onClose={() => setDownloadOpen(false)}
      />
    </Player.Provider>
  );
}
