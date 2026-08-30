import "@videojs/react/video/skin.css";
import "@videojs/react/i18n/locales/zh-CN/register";
import {
  BufferingIndicator,
  createPlayer,
  Poster,
  selectControls,
  selectPlayback,
  selectQuality,
  selectSource,
  selectTime,
  selectVolume,
  Tooltip,
  useContainer,
  useHotkey,
  usePlayer,
  videoFeatures,
} from "@videojs/react";
import { I18nProvider } from "@videojs/react/i18n";
import { SpinnerIcon } from "@videojs/react/icons";
import { VideoSkin, Video } from "@videojs/react/video";
import { Alert, Button, Tooltip as AntdTooltip } from "antd";
import {
  IconArrowLeft,
  IconDownload,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconLink,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import type { NewsInfo } from "../api/types";
import DownloadVideoModal from "./DownloadVideoModal";
import {
  getEmbeddedVideo,
  isEmbeddedPlayback,
} from "../utils/videoPlayback";
import "./VideoPlayer.css";

const { Player } = createPlayer({ features: videoFeatures });
const volumeStorageKey = "video-player-volume";

type StoredVolume = {
  volume: number;
  muted: boolean;
};

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
    <Tooltip.Provider>
      <nav
        className="video-player-navigation"
        data-visible={controlsVisible ? "" : undefined}
        aria-label="视频操作"
      >
        <span className="video-player-navigation-surface media-surface">
          <VideoPlayerControlTooltip
            label="返回"
            trigger={
              <button
                type="button"
                className="media-button media-button--subtle media-button--icon"
                aria-label="返回"
                onClick={onBack}
              >
                <IconArrowLeft className="media-icon" aria-hidden="true" />
              </button>
            }
          />
        </span>
        <span className="video-player-navigation-source video-player-navigation-surface media-surface">
          <VideoPlayerControlTooltip
            label="查看来源"
            trigger={
              <a
                className="media-button media-button--subtle media-button--icon"
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="查看来源"
              >
                <IconLink className="media-icon" aria-hidden="true" />
              </a>
            }
          />
        </span>
      </nav>
    </Tooltip.Provider>
  );
}

function EmbeddedVideoPlayer({
  news,
  onBack,
}: Pick<VideoPlayerProps, "news" | "onBack">) {
  const embeddedVideo =
    getEmbeddedVideo(news.video_url) ?? getEmbeddedVideo(news.source_url);
  const downloadNotice = embeddedVideo
    ? `${embeddedVideo.platformName}平台视频不能直接下载，请通过嵌入播放器观看`
    : "该视频无法直接下载，请前往原平台观看";

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {embeddedVideo ? (
          <iframe
            className="h-full w-full border-0"
            src={embeddedVideo.embedUrl}
            title={`${news.title} - ${embeddedVideo.platformName} 播放器`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <Alert
              type="error"
              showIcon
              title="暂不支持这个视频平台"
              description="请通过下方提示栏中的来源链接前往原平台观看"
            />
          </div>
        )}
      </div>
      <Alert
        banner
        showIcon
        type="info"
        title={downloadNotice}
        action={
          <div className="flex shrink-0 items-center gap-1">
            <AntdTooltip title="返回">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<IconArrowLeft size={18} aria-hidden="true" />}
                aria-label="返回"
                onClick={onBack}
              />
            </AntdTooltip>
            <AntdTooltip title="查看来源">
              <Button
                type="text"
                size="small"
                shape="circle"
                icon={<IconLink size={18} aria-hidden="true" />}
                aria-label="查看来源"
                href={news.source_url}
                target="_blank"
                rel="noopener noreferrer"
              />
            </AntdTooltip>
          </div>
        }
      />
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

function VideoPlayerControlTooltip({
  label,
  shortcut,
  trigger,
}: {
  label: string;
  shortcut?: string;
  trigger: ReactElement;
}) {
  return (
    <Tooltip.Root side="top">
      <Tooltip.Trigger render={trigger} />
      <Tooltip.Popup className="video-player-tooltip media-surface media-tooltip">
        <Tooltip.Label>{label}</Tooltip.Label>
        {shortcut ? (
          <Tooltip.Shortcut className="media-tooltip__kbd">
            {shortcut}
          </Tooltip.Shortcut>
        ) : null}
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

function VideoPlayerLoadingIndicator() {
  const source = usePlayer(selectSource);
  const playback = usePlayer(selectPlayback);
  const initialLoading = Boolean(
    source?.source &&
      !source.canPlay &&
      playback?.paused &&
      !playback.started,
  );

  return (
    <BufferingIndicator
      delay={500}
      render={(props, state) => {
        const loadingState = initialLoading
          ? "initial"
          : state.visible
            ? "buffering"
            : undefined;

        return (
          <div
            {...props}
            className="video-player-loading-indicator"
            data-visible={loadingState !== undefined ? "" : undefined}
            data-loading-state={loadingState}
            role="status"
            aria-label="视频加载中"
            aria-hidden={loadingState === undefined}
          >
            {loadingState !== undefined ? <VideoPlayerSpinner /> : null}
          </div>
        );
      }}
    />
  );
}

function VideoPlayerVolumePersistence() {
  const volume = usePlayer(selectVolume);
  const restored = useRef(false);

  useEffect(() => {
    if (!volume) return;

    if (!restored.current) {
      if (
        volume.volumeAvailability === "unavailable" &&
        volume.mutedAvailability === "unavailable"
      ) {
        return;
      }

      restored.current = true;

      try {
        const storedValue = localStorage.getItem(volumeStorageKey);
        if (storedValue) {
          const stored = JSON.parse(storedValue) as Partial<StoredVolume>;
          const storedVolume = stored.volume;
          const storedMuted = stored.muted;

          if (
            typeof storedVolume === "number" &&
            Number.isFinite(storedVolume) &&
            storedVolume >= 0 &&
            storedVolume <= 1 &&
            typeof storedMuted === "boolean"
          ) {
            volume.setVolume(storedVolume);
            if (storedMuted !== volume.muted) volume.toggleMuted();
            return;
          }
        }
      } catch {
        // Ignore unavailable storage and malformed values
      }
    }

    try {
      localStorage.setItem(
        volumeStorageKey,
        JSON.stringify({ volume: volume.volume, muted: volume.muted }),
      );
    } catch {
      // The player remains usable when storage is unavailable
    }
  }, [volume]);

  return null;
}

function VideoPlayerCustomControls({
  onDownload,
  sourceUrl,
}: {
  onDownload: () => void;
  sourceUrl: string;
}) {
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

  useHotkey({
    keys: "-",
    onActivate: () => seekFrame(-1),
  });
  useHotkey({
    keys: "=",
    onActivate: () => seekFrame(1),
  });
  useHotkey({
    keys: "d",
    repeatable: false,
    onActivate: onDownload,
  });

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
    <Tooltip.Provider>
      {createPortal(
        <>
          <VideoPlayerControlTooltip
            label="上一帧"
            shortcut="-"
            trigger={
              <button
                type="button"
                className="media-button media-button--subtle media-button--icon"
                aria-label="上一帧"
                aria-keyshortcuts="-"
                onClick={() => seekFrame(-1)}
              >
                <IconPlayerTrackPrev
                  className="media-icon"
                  aria-hidden="true"
                />
              </button>
            }
          />
          <VideoPlayerControlTooltip
            label="下一帧"
            shortcut="="
            trigger={
              <button
                type="button"
                className="media-button media-button--subtle media-button--icon"
                aria-label="下一帧"
                aria-keyshortcuts="="
                onClick={() => seekFrame(1)}
              >
                <IconPlayerTrackNext
                  className="media-icon"
                  aria-hidden="true"
                />
              </button>
            }
          />
        </>,
        controlGroups.left,
      )}
      {createPortal(
        <>
          <VideoPlayerControlTooltip
            label="查看来源"
            trigger={
              <a
                className="video-player-source-control media-button media-button--subtle media-button--icon"
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="查看来源"
              >
                <IconLink className="media-icon" aria-hidden="true" />
              </a>
            }
          />
          <VideoPlayerControlTooltip
            label="下载视频"
            shortcut="D"
            trigger={
              <button
                type="button"
                className="video-player-download-control media-button media-button--subtle media-button--icon"
                aria-label="下载视频"
                aria-keyshortcuts="d"
                onClick={onDownload}
              >
                <IconDownload className="media-icon" aria-hidden="true" />
              </button>
            }
          />
        </>,
        controlGroups.right,
      )}
    </Tooltip.Provider>
  );
}

export default function VideoPlayer({
  news,
  gameId,
  gameName,
  onBack,
}: VideoPlayerProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);

  if (isEmbeddedPlayback(news)) {
    return <EmbeddedVideoPlayer news={news} onBack={onBack} />;
  }

  return (
    <Player>
      <I18nProvider locale="zh-CN">
        <VideoSkin className="video-player-skin aspect-video w-full overflow-hidden">
          <Poster src={news.cover ?? undefined} alt={news.title} />
          <Video
            src={news.video_url ?? undefined}
            playsInline
            autoPlay={!import.meta.env.DEV}
          />
          <VideoPlayerVolumePersistence />
          <VideoPlayerLoadingIndicator />
          <VideoPlayerNavigation onBack={onBack} sourceUrl={news.source_url} />
          <VideoPlayerCustomControls
            onDownload={() => setDownloadOpen(true)}
            sourceUrl={news.source_url}
          />
        </VideoSkin>
      </I18nProvider>
      <DownloadVideoModal
        open={downloadOpen}
        news={news}
        gameId={gameId}
        gameName={gameName}
        videoUrl={news.video_url}
        onClose={() => setDownloadOpen(false)}
      />
    </Player>
  );
}
