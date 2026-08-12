import {
  Button,
  Dropdown,
  Flex,
  Skeleton,
  Tag,
  Typography,
  type MenuProps,
} from "antd";
import { Link } from "react-router";
import type { NewsInfo } from "../../api/types";
import dayjs from "dayjs";
import { IconDotsVertical } from "@tabler/icons-react";
import {
  DownloadOutlined,
  ExportOutlined,
  LinkOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useCopyText } from "../../hooks/useCopyText";
import { formatDuration } from "../../libs/formatDuration";
import { getNewsVideo } from "../../api/useNewsVideo";
import { useEffect, useRef, useState } from "react";
import DownloadVideoModal from "../DownloadVideoModal";

const { Title, Text } = Typography;

type VideoCardProps = {
  video: NewsInfo;
  gameId: string;
  gameName: string;
  sourceId: string;
};

const dropdownMenuItems: MenuProps["items"] = [
  {
    label: "复制视频链接",
    key: "1",
    icon: <LinkOutlined />,
  },
  {
    label: "下载",
    key: "2",
    icon: <DownloadOutlined />,
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

export default function VideoCard({
  video,
  gameId,
  gameName,
  sourceId,
}: VideoCardProps) {
  const copyWithMessage = useCopyText();
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(
    null,
  );
  const videoUrl = video.video_url ?? resolvedVideoUrl;
  const videoUrlRequest = useRef<Promise<string> | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const videoDuration = video.video_duration;

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

    const request = getNewsVideo(gameId, video.id, sourceId)
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
        to={`/${gameId}/videos/${sourceId}/${video.id}`}
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      >
        <div
          className="
            pb-2 relative
            transition-transform duration-300 ease-out
            motion-safe:group-hover:scale-[1.03]
          "
        >
          {video.cover ? (
            <img
              src={video.cover}
              alt={video.title}
              className="aspect-video w-full rounded-xl object-cover"
            />
          ) : (
            <Skeleton.Image active />
          )}
          <Tag
            className="
              absolute! bottom-4 right-2
              m-0! rounded! border-0! bg-black/70! px-1.5! py-0.5! text-xs! leading-none! text-white!
            "
          >
            {formatDuration(videoDuration)}
          </Tag>
        </div>
      </Link>
      <Flex justify="space-between">
        <Link
          to={`/${gameId}/videos/${sourceId}/${video.id}`}
          state={{
            from: `${location.pathname}${location.search}`,
          }}
        >
          <div>
            <Title
              level={5}
              className="mb-0! line-clamp-2! text-base! leading-6! font-semibold!"
            >
              {video.title}
            </Title>

            <Text type="secondary" className="mt-1! block! text-sm!">
              {video.publish_time
                ? dayjs(video.publish_time).format("YYYY年MM月DD日HH:mm:ss")
                : "未知时间"}
            </Text>
          </div>
        </Link>
        <Dropdown
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          menu={{ items: dropdownMenuItems, onClick: onDropdownMenuClick }}
        >
          <Button type="text" icon={<IconDotsVertical />} />
        </Dropdown>
      </Flex>
      <DownloadVideoModal
        open={downloadOpen}
        news={video}
        gameId={gameId}
        gameName={gameName}
        videoUrl={videoUrl}
        onClose={() => setDownloadOpen(false)}
      />
    </Flex>
  );
}
