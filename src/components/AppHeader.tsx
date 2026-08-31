import { Button, Flex, Layout, Tooltip } from "antd";
import HeaderLogo from "../assets/logo-header.webp";
import { Link } from "react-router";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import {
  IconBrandGithub,
  IconHelpCircle,
  IconMoon,
  IconSun,
  IconSunMoon,
} from "@tabler/icons-react";
import type { CSSProperties } from "react";
import { useThemeMode } from "../theme/ThemeContext";

const { Header } = Layout;

const appHeaderStyle = {
  boxShadow:
    "0 1px 2px 0 rgb(0 0 0 / 3%), 0 1px 6px -1px rgb(0 0 0 / 2%), 0 2px 4px 0 rgb(0 0 0 / 2%)",
} satisfies CSSProperties;

type AppHeaderProps = {
  siderOpen?: boolean;
  onToggleSider?: () => void;
  onOpenDownloadGuide?: () => void;
  showRightItems?: boolean;
};

export default function AppHeader({
  siderOpen = false,
  onToggleSider,
  onOpenDownloadGuide,
  showRightItems = true,
}: AppHeaderProps) {
  return (
    <Header
      id="app-header"
      style={appHeaderStyle}
      className="relative z-1 flex! items-center! justify-between! border-b border-b-black/6 px-[clamp(16px,4vw,48px)]! dark:border-b-white/12"
    >
      <LeftItems siderOpen={siderOpen} onToggleSider={onToggleSider} />
      {showRightItems && (
        <RightItems onOpenDownloadGuide={onOpenDownloadGuide} />
      )}
    </Header>
  );
}

function LeftItems({
  siderOpen,
  onToggleSider,
}: Pick<AppHeaderProps, "siderOpen" | "onToggleSider">) {
  return (
    <Flex className="h-full min-w-0" align="center" gap="small">
      {onToggleSider && (
        <Button
          type="text"
          shape="circle"
          className="md:hidden!"
          icon={siderOpen ? <CloseOutlined /> : <MenuOutlined />}
          aria-label={siderOpen ? "关闭导航菜单" : "打开导航菜单"}
          onClick={onToggleSider}
        />
      )}
      <Link
        to="/"
        reloadDocument
        aria-label="影像档案架"
        className="flex h-full min-w-0 items-center text-inherit! no-underline! hover:text-inherit!"
      >
        <Flex
          className="header-left-items h-full min-w-0 cursor-pointer py-3.25 leading-8 text-xl font-semibold"
          align="center"
          gap="small"
        >
          <img
            src={HeaderLogo}
            alt=""
            width={320}
            height={117}
            className="h-8 w-auto"
            draggable="false"
            fetchPriority="high"
          />
          <span className="hidden min-[470px]:inline">影像档案架</span>
        </Flex>
      </Link>
    </Flex>
  );
}

function RightItems({
  onOpenDownloadGuide,
}: Pick<AppHeaderProps, "onOpenDownloadGuide">) {
  return (
    <Flex
      className="header-right-items h-full hidden! min-[293px]:flex!"
      align="center"
      gap="small"
    >
      <DownloadGuideButton onClick={onOpenDownloadGuide!} />
      <ThemeToggle />
      <GithubButton />
    </Flex>
  );
}

function DownloadGuideButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip placement="bottom" title="下载帮助">
      <Button
        type="text"
        shape="circle"
        icon={<IconHelpCircle size={18} />}
        aria-label="查看下载帮助"
        onClick={onClick}
      />
    </Tooltip>
  );
}

function ThemeToggle() {
  const { mode, cycleTheme } = useThemeMode();

  const config = {
    light: { icon: <IconSun size={18} />, title: "浅色模式" },
    dark: { icon: <IconMoon size={18} />, title: "深色模式" },
    system: { icon: <IconSunMoon size={18} />, title: "跟随系统" },
  }[mode];

  return (
    <Tooltip title={config.title}>
      <Button
        type="text"
        shape="circle"
        icon={config.icon}
        aria-label={`当前：${config.title}；点击切换主题`}
        onClick={cycleTheme}
      />
    </Tooltip>
  );
}

function GithubButton() {
  return (
    <Tooltip placement="bottom" title="GitHub">
      <Button
        type="text"
        shape="circle"
        href="https://github.com/Trrrrw/hoyo_video"
        target="_blank"
        rel="noopener noreferrer"
        icon={<IconBrandGithub size={18} />}
        aria-label="GitHub"
      />
    </Tooltip>
  );
}
