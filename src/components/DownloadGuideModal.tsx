import { Alert, Button, Card, Flex, Modal, Typography } from "antd";
import {
  IconDownload,
  IconDotsVertical,
  IconPlayerPlay,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

const { Text } = Typography;

type DownloadGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

type DownloadMethodProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function DownloadMethod({
  icon,
  title,
  description,
  children,
}: DownloadMethodProps) {
  return (
    <Card size="small" className="h-full">
      <Flex vertical gap="small" className="h-full">
        <Flex align="center" gap="small">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            {icon}
          </span>
          <Text strong>{title}</Text>
        </Flex>
        <Text type="secondary" className="text-sm! leading-6!">
          {description}
        </Text>
        <div className="mt-auto rounded-lg bg-black/4 px-3 py-2.5 dark:bg-white/6">
          {children}
        </div>
      </Flex>
    </Card>
  );
}

export default function DownloadGuideModal({
  open,
  onClose,
}: DownloadGuideModalProps) {
  return (
    <Modal
      title="如何下载视频"
      open={open}
      centered
      width={640}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          知道了
        </Button>
      }
    >
      <Flex vertical gap="middle">
        <Text type="secondary">
          本站提供两种下载入口，选择离当前页面最近的一种即可
        </Text>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DownloadMethod
            icon={<IconDotsVertical size={20} aria-hidden="true" />}
            title="从视频列表下载"
            description="适合浏览列表时直接下载，不需要先进入播放页面"
          >
            <Flex align="center" gap="small" wrap>
              <span className="inline-flex size-7 items-center justify-center rounded-md border border-black/10 dark:border-white/15">
                <IconDotsVertical size={17} aria-hidden="true" />
              </span>
              <Text>打开卡片菜单</Text>
              <Text type="secondary">→</Text>
              <Flex align="center" gap={4}>
                <IconDownload size={16} aria-hidden="true" />
                <Text strong>下载</Text>
              </Flex>
            </Flex>
          </DownloadMethod>

          <DownloadMethod
            icon={<IconPlayerPlay size={20} aria-hidden="true" />}
            title="从播放页面下载"
            description="适合观看视频时下载当前视频及其封面"
          >
            <Flex align="center" gap="small" wrap>
              <Text>播放器右下角</Text>
              <Text type="secondary">→</Text>
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black">
                <IconDownload size={16} aria-hidden="true" />
              </span>
              <Text strong>下载按钮</Text>
            </Flex>
          </DownloadMethod>
        </div>

        <Alert
          type="info"
          showIcon
          title="浏览器打开视频而没有直接下载？"
          description="打开具体视频的下载窗口后，网站会根据 iPhone、iPad、Android 或电脑显示对应的文件保存方法"
        />

        <Text type="secondary" className="text-xs!">
          使用视频及封面时，请遵守相关网站的使用条款和相关版权规定
        </Text>
      </Flex>
    </Modal>
  );
}
