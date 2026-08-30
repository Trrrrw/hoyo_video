import {
  Button,
  Dropdown,
  Flex,
  Typography,
  type MenuProps,
} from "antd";
import { Link, useLocation } from "react-router";
import type { NewsInfo } from "../../api/types";
import dayjs from "dayjs";
import { IconDotsVertical, IconPlayerPlay } from "@tabler/icons-react";
import {
  DownloadOutlined,
  ExportOutlined,
  LinkOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useCopyText } from "../../hooks/useCopyText";
import { fetchNewsVideo } from "../../api/newsVideo";
import { formatDuration } from "../../utils/formatDuration";
import { useEffect, useRef, useState } from "react";
import DownloadVideoModal from "../DownloadVideoModal";
import { isEmbeddedPlayback } from "../../utils/videoPlayback";

const { Title, Text } = Typography;

type VideoCardProps = {
  video: NewsInfo;
  gameId: string;
  gameName: string;
  sourceId: string;
  publishTimeHref?: string | null;
};

export default function VideoCard({
  video,
  gameId,
  gameName,
  sourceId,
  publishTimeHref,
}: VideoCardProps) {
  const currentLocation = useLocation();
  const copyWithMessage = useCopyText();
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(
    null,
  );
  const videoUrl = video.video_url ?? resolvedVideoUrl;
  const videoUrlRequest = useRef<Promise<string> | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const embeddedPlayback = isEmbeddedPlayback(video);
  const dropdownMenuItems: MenuProps["items"] = [
    {
      label: "复制视频链接",
      key: "1",
      icon: <LinkOutlined />,
    },
    {
      label: embeddedPlayback ? "该视频无法直接下载" : "下载",
      key: "2",
      icon: <DownloadOutlined />,
      disabled: embeddedPlayback,
    },
    {
      label: "分享",
      key: "3",
      icon: <ShareAltOutlined />,
    },
    {
      label: "前往",
      key: "4",
      icon: <ExportOutlined />,
    },
  ];
  const videoDuration = video.video_duration;
  const publishTimeLabel = video.publish_time
    ? dayjs(video.publish_time).format("YYYY年MM月DD日HH:mm:ss")
    : "未知时间";
  const from = `${currentLocation.pathname}${currentLocation.search}${currentLocation.hash}`;
  const detailHref = `/${gameId}/videos/${sourceId}/${video.id}`;

  useEffect(() => {
    if (!dropdownOpen) return;

    const closeOnScroll = () => setDropdownOpen(false);
    document.addEventListener("scroll", closeOnScroll, true);

    return () => {
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, [dropdownOpen]);

  const resolveVideoUrl = () => {
    if (videoUrl) return Promise.resolve(videoUrl);
    if (video.news_type !== "video") {
      return Promise.reject(new Error("当前内容不是视频"));
    }
    if (videoUrlRequest.current) return videoUrlRequest.current;

    const request = fetchNewsVideo(gameId, video.id, sourceId)
      .then(({ video_url }) => {
        setResolvedVideoUrl(video_url);
        return video_url;
      })
      .finally(() => {
        if (videoUrlRequest.current === request) {
          videoUrlRequest.current = null;
        }
      });

    videoUrlRequest.current = request;
    return request;
  };

  const onDropdownMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      void copyWithMessage(
        resolveVideoUrl(),
        "已复制视频链接",
        "复制失败，无法获取视频链接",
      );
    }
    if (key === "2") {
      if (embeddedPlayback) return;
      setDownloadOpen(true);
      if (!videoUrl) void resolveVideoUrl().catch(() => undefined);
    }
    if (key === "3") {
      const fullUrl = new URL(
        `/${gameId}/videos/${sourceId}/${video.id}`,
        window.location.origin,
      ).href;
      void copyWithMessage(fullUrl, "已复制页面链接");
    }
    if (key === "4") window.open(video.source_url, "_blank");
  };

  return (
    <Flex vertical className="group block text-inherit! pb-2">
      <Link
        to={detailHref}
        state={{
          from,
        }}
        className="block text-inherit! focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none"
      >
        <div
          className="relative pb-2"
        >
          <div className="group/media relative aspect-video overflow-hidden rounded-xl bg-black/6 shadow-sm ring-1 ring-black/6 dark:bg-white/10 dark:ring-white/10">
            {video.cover ? (
              <img
                src={video.cover}
                alt=""
                loading="lazy"
                draggable={false}
                className="h-full w-full transform-gpu object-cover transition-transform duration-300 ease-out will-change-transform group-hover/media:scale-[1.04]"
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                className="h-full w-full text-[var(--ant-color-text-tertiary)]"
                style={{ background: "var(--ant-color-fill-secondary)" }}
              >
                <IconPlayerPlay size={32} stroke={1.5} aria-hidden="true" />
              </Flex>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.52), transparent)",
              }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover/media:bg-black/20">
              <span className="flex size-11 scale-90 items-center justify-center rounded-full bg-white/92 text-black opacity-0 shadow-lg transition-[transform,opacity] duration-200 ease-out group-hover/media:scale-100 group-hover/media:opacity-100 dark:bg-black/80 dark:text-white">
                <IconPlayerPlay size={21} stroke={2} aria-hidden="true" />
              </span>
            </div>
            {videoDuration !== null && (
              <span className="absolute right-2 bottom-2 rounded-md bg-black/75 px-1.5 py-1 text-[11px] leading-none font-medium tracking-wide text-white shadow-sm">
                {formatDuration(videoDuration)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <Flex justify="space-between">
        <div>
          <Link
            to={detailHref}
            state={{
              from,
            }}
          >
            <Title
              level={2}
              className="mb-0! line-clamp-2! text-base! leading-6! font-semibold!"
            >
              {video.title}
            </Title>
          </Link>

          {publishTimeHref === null ? (
            <Text type="secondary" className="mt-1! block! text-sm!">
              {publishTimeLabel}
            </Text>
          ) : publishTimeHref ? (
            <Link
              to={publishTimeHref}
              className="mt-1! block! text-inherit! text-sm!"
            >
              <Text type="secondary">{publishTimeLabel}</Text>
            </Link>
          ) : (
            <Link
              to={detailHref}
              state={{ from }}
              className="mt-1! block! text-inherit! text-sm!"
            >
              <Text type="secondary">{publishTimeLabel}</Text>
            </Link>
          )}
        </div>
        <Dropdown
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          menu={{ items: dropdownMenuItems, onClick: onDropdownMenuClick }}
        >
          <Button
            type="text"
            icon={<IconDotsVertical />}
            aria-label={`更多操作：${video.title}`}
          />
        </Dropdown>
      </Flex>
      {!embeddedPlayback && (
        <DownloadVideoModal
          open={downloadOpen}
          news={video}
          gameId={gameId}
          gameName={gameName}
          videoUrl={videoUrl}
          onClose={() => setDownloadOpen(false)}
        />
      )}
    </Flex>
  );
}
