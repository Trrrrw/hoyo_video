import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Checkbox,
  Flex,
  Input,
  Modal,
  Tabs,
  Typography,
} from "antd";
import {
  IconDownload,
  IconFileTypeXml,
  IconPhoto,
  IconPlugConnected,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import {
  findSeriesEpisodeNumber,
  getEpisodeNfoUrl,
  getMovieNfoUrl,
  getSeriesNfoUrl,
} from "../api/newsNfo";
import type { NewsInfo } from "../api/types";
import {
  addAria2Uri,
  getAria2Version,
  type Aria2Settings,
} from "../services/aria2";
import {
  getUrlExtension,
  joinDownloadPath,
  sanitizeFileName,
} from "../utils/downloadFiles";

const aria2SettingsKey = "aria2-settings-v1";
const defaultAria2Settings: Aria2Settings = {
  rpcUrl: "http://localhost:6800/jsonrpc",
  secret: "",
  downloadDir: "",
};

type DownloadVideoModalProps = {
  open: boolean;
  news: NewsInfo;
  gameId: string;
  gameName: string;
  videoUrl: string | null;
  onClose: () => void;
};

type DownloadPlatform = "ios" | "android" | "other";
type DownloadAction = "video" | "cover" | "nfo" | "emby" | null;

type StoredAria2Config = {
  settings: Aria2Settings;
  remember: boolean;
};

function loadAria2Config(): StoredAria2Config {
  try {
    const value = localStorage.getItem(aria2SettingsKey);
    if (!value) return { settings: defaultAria2Settings, remember: false };

    return {
      settings: {
        ...defaultAria2Settings,
        ...(JSON.parse(value) as Partial<Aria2Settings>),
      },
      remember: true,
    };
  } catch {
    return { settings: defaultAria2Settings, remember: false };
  }
}

function detectDownloadPlatform(): DownloadPlatform {
  if (typeof navigator === "undefined") return "other";

  const userAgent = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

function getErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "未知错误";
  return `${message}。请检查 RPC 地址、密钥、跨域设置以及 HTTPS 配置`;
}

function DownloadLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-4"
    >
      {children}
    </a>
  );
}

type Aria2ConfigFieldsProps = {
  idPrefix: string;
  settings: Aria2Settings;
  remember: boolean;
  testing: boolean;
  directoryLabel: string;
  directoryPlaceholder: string;
  onSettingsChange: (patch: Partial<Aria2Settings>) => void;
  onRememberChange: (remember: boolean) => void;
  onTest: () => void;
};

function Aria2ConfigFields({
  idPrefix,
  settings,
  remember,
  testing,
  directoryLabel,
  directoryPlaceholder,
  onSettingsChange,
  onRememberChange,
  onTest,
}: Aria2ConfigFieldsProps) {
  return (
    <Card size="small" title="Aria2 RPC 配置">
      <Flex vertical gap="small">
        <label htmlFor={`${idPrefix}-rpc-url`}>
          <Typography.Text>RPC 地址</Typography.Text>
        </label>
        <Input
          id={`${idPrefix}-rpc-url`}
          value={settings.rpcUrl}
          placeholder="http://localhost:6800/jsonrpc"
          onChange={(event) => onSettingsChange({ rpcUrl: event.target.value })}
        />

        <label htmlFor={`${idPrefix}-rpc-secret`}>
          <Typography.Text>RPC 密钥</Typography.Text>
        </label>
        <Input.Password
          id={`${idPrefix}-rpc-secret`}
          value={settings.secret}
          autoComplete="off"
          placeholder="未设置密钥时留空"
          onChange={(event) => onSettingsChange({ secret: event.target.value })}
        />

        <label htmlFor={`${idPrefix}-download-dir`}>
          <Typography.Text>{directoryLabel}</Typography.Text>
        </label>
        <Input
          id={`${idPrefix}-download-dir`}
          value={settings.downloadDir}
          placeholder={directoryPlaceholder}
          onChange={(event) =>
            onSettingsChange({ downloadDir: event.target.value })
          }
        />

        <Flex justify="space-between" align="center" gap="small" wrap>
          <Checkbox
            checked={remember}
            onChange={(event) => onRememberChange(event.target.checked)}
          >
            在此设备记住配置（包含密钥）
          </Checkbox>
          <Button
            icon={<IconPlugConnected size={16} />}
            loading={testing}
            onClick={onTest}
          >
            测试连接
          </Button>
        </Flex>

        <Typography.Text type="secondary" className="text-xs!">
          RPC 请求由当前浏览器直接发送，配置不会提交到本站后端
        </Typography.Text>
      </Flex>
    </Card>
  );
}

function BrowserDownloadPanel({
  videoUrl,
  coverUrl,
  nfoUrl,
}: {
  videoUrl: string | null;
  coverUrl: string | null;
  nfoUrl: string;
}) {
  const platform = useMemo(detectDownloadPlatform, []);
  const instruction =
    platform === "ios"
      ? "请长按下面的链接，在弹出菜单中选择“下载链接文件”。"
      : platform === "android"
        ? "请长按下面的链接，在弹出菜单中选择“下载链接”或“下载链接文件”。不同浏览器的菜单名称可能略有不同。"
        : "点击链接后可能会在新标签页中打开。视频请右键选择“视频另存为”，封面请右键选择“图片另存为”。";

  return (
    <Flex vertical gap="middle">
      <Alert
        type="info"
        showIcon
        title={
          platform === "ios"
            ? "iPhone / iPad 下载方式"
            : platform === "android"
              ? "Android 下载方式"
              : "电脑下载方式"
        }
        description={instruction}
      />
      <Flex vertical gap="small">
        <Card
          size="small"
          title={
            <Flex align="center" gap="small">
              <IconDownload size={16} aria-hidden="true" />
              <span>视频文件</span>
            </Flex>
          }
        >
          {videoUrl ? (
            <DownloadLink href={videoUrl}>下载视频链接</DownloadLink>
          ) : (
            <Typography.Text type="secondary">
              当前视频暂无可用播放地址
            </Typography.Text>
          )}
        </Card>
        <Card
          size="small"
          title={
            <Flex align="center" gap="small">
              <IconPhoto size={16} aria-hidden="true" />
              <span>封面图片</span>
            </Flex>
          }
        >
          {coverUrl ? (
            <DownloadLink href={coverUrl}>下载封面链接</DownloadLink>
          ) : (
            <Typography.Text type="secondary">
              当前视频暂无可用封面
            </Typography.Text>
          )}
        </Card>
        <Card
          size="small"
          title={
            <Flex align="center" gap="small">
              <IconFileTypeXml size={16} aria-hidden="true" />
              <span>NFO 元数据</span>
            </Flex>
          }
        >
          <DownloadLink href={nfoUrl}>下载独立影片 NFO</DownloadLink>
        </Card>
      </Flex>
    </Flex>
  );
}

function formatEpisodeNumber(value: number) {
  return String(value).padStart(2, "0");
}

export default function DownloadVideoModal({
  open,
  news,
  gameId,
  gameName,
  videoUrl,
  onClose,
}: DownloadVideoModalProps) {
  const { message } = AntdApp.useApp();
  const [initialConfig] = useState(loadAria2Config);
  const [aria2Settings, setAria2Settings] = useState(initialConfig.settings);
  const [rememberSettings, setRememberSettings] = useState(
    initialConfig.remember,
  );
  const [testing, setTesting] = useState(false);
  const [downloadAction, setDownloadAction] =
    useState<DownloadAction>(null);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [episodeNumberLoading, setEpisodeNumberLoading] = useState(false);

  const safeTitle = sanitizeFileName(news.title);
  const primaryTag = news.tags[0];
  const safePrimaryTag = sanitizeFileName(primaryTag ?? "其他视频");
  const safeGameName = sanitizeFileName(gameName || "未知游戏");
  const seriesName = sanitizeFileName(`《${safeGameName}》${safePrimaryTag}`);
  const videoExtension = getUrlExtension(videoUrl, ".mp4");
  const coverExtension = getUrlExtension(news.cover, ".jpg");
  const videoFileName = `${safeTitle}${videoExtension}`;
  const coverFileName = `${safeTitle}-cover${coverExtension}`;
  const movieNfoFileName = `${safeTitle}.nfo`;
  const movieNfoUrl = getMovieNfoUrl(gameId, news.source_id, news.id);
  const episodeCode = `S${formatEpisodeNumber(seasonNumber)}E${formatEpisodeNumber(episodeNumber)}`;
  const episodeFileBase = sanitizeFileName(
    `${seriesName} - ${episodeCode} - ${safeTitle}`,
  );
  const seriesDirectory = joinDownloadPath(
    aria2Settings.downloadDir,
    seriesName,
  );
  const seasonDirectory = joinDownloadPath(
    seriesDirectory,
    `Season ${seasonNumber}`,
  );
  const standaloneVideoDirectory = joinDownloadPath(
    seriesDirectory,
    safeTitle,
  );
  const seriesNfoUrl = primaryTag
    ? getSeriesNfoUrl(gameId, news.source_id, primaryTag)
    : null;
  const episodeNfoUrl = primaryTag
    ? getEpisodeNfoUrl(
        gameId,
        news.source_id,
        primaryTag,
        news.id,
        seasonNumber,
        episodeNumber,
      )
    : null;
  const embyTreeRoot = aria2Settings.downloadDir.trim() || "Emby 根目录";
  const embyTree = primaryTag
    ? [
        `${embyTreeRoot}/`,
        `└─ ${seriesName}/`,
        "   ├─ tvshow.nfo",
        `   └─ Season ${seasonNumber}/`,
        `      ├─ ${episodeFileBase}${videoExtension}`,
        `      ├─ ${episodeFileBase}.nfo`,
        `      └─ ${episodeFileBase}-thumb${coverExtension}`,
      ].join("\n")
    : [
        `${embyTreeRoot}/`,
        `└─ ${seriesName}/`,
        `   └─ ${safeTitle}/`,
        `      ├─ ${videoFileName}`,
        `      ├─ ${movieNfoFileName}`,
        `      └─ poster${coverExtension}`,
      ].join("\n");

  useEffect(() => {
    let cancelled = false;

    setSeasonNumber(1);
    setEpisodeNumber(1);
    setEpisodeNumberLoading(false);

    if (!open || !primaryTag) return;

    setEpisodeNumberLoading(true);
    void findSeriesEpisodeNumber(
      gameId,
      news.source_id,
      primaryTag,
      news.id,
    )
      .then((number) => {
        if (!cancelled && number !== null) setEpisodeNumber(number);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setEpisodeNumberLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, news.id, news.source_id, open, primaryTag]);

  const persistSettings = (settings = aria2Settings) => {
    if (rememberSettings) {
      localStorage.setItem(aria2SettingsKey, JSON.stringify(settings));
    }
  };

  const updateSettings = (patch: Partial<Aria2Settings>) => {
    setAria2Settings((current) => {
      const next = { ...current, ...patch };
      if (rememberSettings) {
        localStorage.setItem(aria2SettingsKey, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleRememberChange = (remember: boolean) => {
    setRememberSettings(remember);
    if (remember) {
      localStorage.setItem(aria2SettingsKey, JSON.stringify(aria2Settings));
    } else {
      localStorage.removeItem(aria2SettingsKey);
    }
  };

  const handleTestConnection = async () => {
    if (!aria2Settings.rpcUrl.trim()) {
      void message.warning("请先填写 Aria2 RPC 地址");
      return;
    }

    setTesting(true);
    persistSettings();
    try {
      const result = await getAria2Version(aria2Settings);
      void message.success(`已连接 Aria2 ${result.version}`);
    } catch (error) {
      void message.error({ content: getErrorMessage(error), duration: 6 });
    } finally {
      setTesting(false);
    }
  };

  const handleAria2Download = async (
    kind: "video" | "cover" | "nfo",
  ) => {
    const uri =
      kind === "video"
        ? videoUrl
        : kind === "cover"
          ? news.cover
          : movieNfoUrl;
    if (!uri) {
      void message.warning(kind === "video" ? "当前视频暂无地址" : "暂无封面");
      return;
    }

    setDownloadAction(kind);
    persistSettings();
    try {
      await addAria2Uri(aria2Settings, uri, {
        dir: aria2Settings.downloadDir.trim() || undefined,
        out:
          kind === "video"
            ? videoFileName
            : kind === "cover"
              ? coverFileName
              : movieNfoFileName,
        allowOverwrite: kind === "nfo",
      });
      const labels = { video: "视频", cover: "封面", nfo: "NFO" };
      void message.success(`${labels[kind]}已发送到 Aria2`);
    } catch (error) {
      void message.error({ content: getErrorMessage(error), duration: 6 });
    } finally {
      setDownloadAction(null);
    }
  };

  const handleEmbyDownload = async () => {
    if (!aria2Settings.downloadDir.trim()) {
      void message.warning("请先填写 Emby 媒体库根目录");
      return;
    }
    if (!videoUrl) {
      void message.warning("当前视频暂无可用播放地址");
      return;
    }
    if (primaryTag && episodeNumberLoading) {
      void message.warning("正在计算集编号，请稍候");
      return;
    }

    setDownloadAction("emby");
    persistSettings();
    try {
      const tasks: Promise<string>[] = [];

      if (primaryTag && seriesNfoUrl && episodeNfoUrl) {
        tasks.push(
          addAria2Uri(aria2Settings, seriesNfoUrl, {
            dir: seriesDirectory,
            out: "tvshow.nfo",
            allowOverwrite: true,
          }),
          addAria2Uri(aria2Settings, videoUrl, {
            dir: seasonDirectory,
            out: `${episodeFileBase}${videoExtension}`,
          }),
          addAria2Uri(aria2Settings, episodeNfoUrl, {
            dir: seasonDirectory,
            out: `${episodeFileBase}.nfo`,
            allowOverwrite: true,
          }),
        );

        if (news.cover) {
          tasks.push(
            addAria2Uri(aria2Settings, news.cover, {
              dir: seasonDirectory,
              out: `${episodeFileBase}-thumb${coverExtension}`,
            }),
          );
        }
      } else {
        tasks.push(
          addAria2Uri(aria2Settings, videoUrl, {
            dir: standaloneVideoDirectory,
            out: videoFileName,
          }),
          addAria2Uri(aria2Settings, movieNfoUrl, {
            dir: standaloneVideoDirectory,
            out: movieNfoFileName,
            allowOverwrite: true,
          }),
        );

        if (news.cover) {
          tasks.push(
            addAria2Uri(aria2Settings, news.cover, {
              dir: standaloneVideoDirectory,
              out: `poster${coverExtension}`,
            }),
          );
        }
      }

      const results = await Promise.allSettled(tasks);
      const successCount = results.filter(
        (result) => result.status === "fulfilled",
      ).length;

      if (successCount === 0) {
        const firstFailure = results.find(
          (result) => result.status === "rejected",
        );
        throw firstFailure?.status === "rejected"
          ? firstFailure.reason
          : new Error("未能添加下载任务");
      }

      if (successCount < results.length) {
        void message.warning(
          `已添加 ${successCount} 个任务，另有 ${results.length - successCount} 个任务失败`,
        );
      } else {
        void message.success(`已向 Aria2 添加 ${successCount} 个 Emby 文件`);
      }
    } catch (error) {
      void message.error({ content: getErrorMessage(error), duration: 6 });
    } finally {
      setDownloadAction(null);
    }
  };

  const aria2ConfigProps = {
    settings: aria2Settings,
    remember: rememberSettings,
    testing,
    onSettingsChange: updateSettings,
    onRememberChange: handleRememberChange,
    onTest: () => void handleTestConnection(),
  };

  return (
    <Modal
      title="下载视频和封面"
      open={open}
      width={720}
      centered
      footer={null}
      styles={{
        body: {
          maxHeight: "calc(100dvh - 10rem)",
          overflowY: "auto",
          overscrollBehavior: "contain",
        },
      }}
      onCancel={onClose}
    >
      <Flex vertical gap="small">
        <Tabs
          defaultActiveKey="browser"
          items={[
            {
              key: "browser",
              label: "浏览器下载",
              children: (
                <BrowserDownloadPanel
                  videoUrl={videoUrl}
                  coverUrl={news.cover}
                  nfoUrl={movieNfoUrl}
                />
              ),
            },
            {
              key: "aria2",
              label: "Aria2",
              children: (
                <Flex vertical gap="middle">
                  <Aria2ConfigFields
                    {...aria2ConfigProps}
                    idPrefix="aria2"
                    directoryLabel="下载目录（可选）"
                    directoryPlaceholder="留空时使用 Aria2 默认目录"
                  />
                  <Card size="small" title="使用视频标题命名">
                    <Flex vertical gap="small">
                      <Typography.Text code>{videoFileName}</Typography.Text>
                      <Typography.Text code>{coverFileName}</Typography.Text>
                      <Typography.Text code>{movieNfoFileName}</Typography.Text>
                      <Flex gap="small" wrap>
                        <Button
                          type="primary"
                          icon={<IconDownload size={16} />}
                          loading={downloadAction === "video"}
                          disabled={!videoUrl}
                          onClick={() => void handleAria2Download("video")}
                        >
                          下载视频
                        </Button>
                        <Button
                          icon={<IconPhoto size={16} />}
                          loading={downloadAction === "cover"}
                          disabled={!news.cover}
                          onClick={() => void handleAria2Download("cover")}
                        >
                          下载封面
                        </Button>
                        <Button
                          icon={<IconFileTypeXml size={16} />}
                          loading={downloadAction === "nfo"}
                          onClick={() => void handleAria2Download("nfo")}
                        >
                          下载 NFO
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                </Flex>
              ),
            },
            {
              key: "emby",
              label: "Emby 目录",
              children: (
                <Flex vertical gap="middle">
                  <Aria2ConfigFields
                    {...aria2ConfigProps}
                    idPrefix="emby"
                    directoryLabel="Emby 媒体库根目录"
                    directoryPlaceholder="例如 D:\\Media\\GameVideos"
                  />
                  {primaryTag ? (
                    <Card size="small" title="季集编号">
                      <Flex vertical gap="small">
                        <Flex gap="middle" wrap>
                          <label className="flex items-center gap-2">
                            <Typography.Text>季</Typography.Text>
                            <Input
                              className="w-24"
                              type="number"
                              inputMode="numeric"
                              min={0}
                              value={seasonNumber}
                              onChange={(event) => {
                                const value = Number.parseInt(
                                  event.target.value,
                                  10,
                                );
                                setSeasonNumber(
                                  Number.isFinite(value)
                                    ? Math.max(0, value)
                                    : 1,
                                );
                              }}
                            />
                          </label>
                          <label className="flex items-center gap-2">
                            <Typography.Text>集</Typography.Text>
                            <Input
                              className="w-24"
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={episodeNumber}
                              onChange={(event) => {
                                const value = Number.parseInt(
                                  event.target.value,
                                  10,
                                );
                                setEpisodeNumber(
                                  Number.isFinite(value)
                                    ? Math.max(1, value)
                                    : 1,
                                );
                              }}
                            />
                          </label>
                        </Flex>
                        <Typography.Text type="secondary" className="text-xs!">
                          {episodeNumberLoading
                            ? "正在按发布时间计算当前视频的集编号"
                            : `当前文件编号为 ${episodeCode}，也可以手动调整`}
                        </Typography.Text>
                      </Flex>
                    </Card>
                  ) : (
                    <Alert
                      type="info"
                      showIcon
                      title="将按独立影片保存"
                      description={`当前视频没有标签，将保存到“${seriesName}”分类目录下自己的视频文件夹中`}
                    />
                  )}
                  <Card size="small" title="目录预览">
                    <pre className="m-0 overflow-x-auto rounded-lg bg-black/4 p-3 text-xs leading-5 dark:bg-white/6">
                      {embyTree}
                    </pre>
                  </Card>
                  <Alert
                    type="info"
                    showIcon
                    title="NFO 由后端生成"
                    description={
                      primaryTag
                        ? "标签 NFO、单集 NFO、视频和封面会一起发送给 Aria2，并保存到对应的系列目录"
                        : "视频 NFO、视频和封面会一起发送给 Aria2，并保存到独立影片目录"
                    }
                  />
                  <Flex gap="small" wrap>
                    <Button
                      type="primary"
                      icon={<IconDownload size={16} />}
                      loading={downloadAction === "emby"}
                      disabled={!videoUrl}
                      onClick={() => void handleEmbyDownload()}
                    >
                      发送 Emby 文件到 Aria2
                    </Button>
                  </Flex>
                </Flex>
              ),
            },
          ]}
        />

        <Typography.Text type="secondary" className="text-xs!">
          使用视频及封面时，请遵守相关网站的使用条款和相关版权规定
        </Typography.Text>
      </Flex>
    </Modal>
  );
}
