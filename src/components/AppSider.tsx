import { Flex, Grid, Layout, Menu, type MenuProps } from "antd";
import { backendUrl } from "../api/client";
import { Link, useLocation, useNavigate } from "react-router";
import { InfoCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useGames } from "../hooks/useGames";
import { useEffect, useState } from "react";
import { getGameIconUrl } from "../utils/gameIcon";

const { Sider } = Layout;
const { useBreakpoint } = Grid;
type SiderMode = "wide" | "compact" | "hidden";
const icpRecord = "皖ICP备2025089713号-2";

type AppSiderProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export default function AppSider({
  mobileOpen,
  onMobileOpenChange,
}: AppSiderProps) {
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);

  const mode: SiderMode = screens.xl
    ? "wide"
    : screens.md
      ? "compact"
      : "hidden";

  useEffect(() => {
    setCollapsed(mode !== "wide");
    if (mode !== "hidden") {
      onMobileOpenChange(false);
    }
  }, [mode, onMobileOpenChange]);

  const closeAfterNavigate = () => {
    if (mode !== "wide") {
      setCollapsed(true);
      if (mode === "hidden") {
        onMobileOpenChange(false);
      }
    }
  };

  const isCollapsed = mode === "hidden" ? !mobileOpen : collapsed;

  return (
    <Sider
      id="app-sider"
      className="border-e border-e-black/6"
      collapsed={isCollapsed}
      collapsedWidth={mode === "hidden" ? 0 : 80}
      collapsible={mode !== "wide"}
      trigger={mode === "hidden" ? null : undefined}
      onCollapse={setCollapsed}
      onBreakpoint={(broken) => {
        if (broken) {
          onMobileOpenChange(false);
        }
      }}
    >
      <Flex className="h-full" vertical justify="space-between">
        <SiderTopItems
          collapsed={collapsed}
          onNavigate={closeAfterNavigate}
        />
        <SiderBottomItems onNavigate={closeAfterNavigate} />
      </Flex>
    </Sider>
  );
}

type SiderItemsProps = {
  onNavigate: () => void;
};

function SiderTopItems({
  collapsed,
  onNavigate,
}: SiderItemsProps & { collapsed: boolean }) {
  const { games, isLoading } = useGames();
  const { pathname } = useLocation();
  const selected = [pathname.split("/")[1]];
  const navigate = useNavigate();

  const menuItems: MenuProps["items"] = [
    {
      key: "search",
      icon: <SearchOutlined />,
      label: "搜索",
      onClick: () => {
        if (selected[0] !== "search") {
          void navigate("/");
        }
      },
    },
    ...games
      .filter((game) => game.news_count.video > 0)
      .sort((a, b) => a.index - b.index)
      .map((game) => {
        const iconUrl = getGameIconUrl(game);

        return {
          key: game.id,
          icon: iconUrl ? (
            <img
              src={backendUrl(iconUrl)}
              alt=""
              className="size-3.5 rounded object-cover"
              draggable={false}
            />
          ) : null,
          label: <Link to={`/${game.id}`}>{game.name}</Link>,
        };
      }),
  ];

  return (
    <div>
      <Menu
        className="border-e-0!"
        items={menuItems}
        selectedKeys={pathname != "/" ? selected : ["search"]}
        onClick={() => {
          onNavigate();
        }}
      />
      {isLoading && (
        <div aria-hidden="true" className="px-1">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className={`my-1 flex h-10 items-center ${
                collapsed ? "justify-center" : "gap-4 px-6"
              }`}
            >
              <span className="block size-3.5 shrink-0 animate-pulse rounded-sm bg-black/10 dark:bg-white/10" />
              {!collapsed && (
                <span
                  className="block h-4 shrink-0 animate-pulse rounded-md bg-black/10 dark:bg-white/10"
                  style={{ width: 104 }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SiderBottomItems({ onNavigate }: SiderItemsProps) {
  const menuItems: MenuProps["items"] = [
    {
      key: "about",
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">关于</Link>,
    },
  ];
  const { pathname } = useLocation();
  const selected = [pathname.split("/")[1]];
  return (
    <Flex vertical>
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        title={icpRecord}
        className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-2 pb-1 text-center text-[10px] leading-4 text-[var(--ant-color-text-secondary)]! hover:text-[var(--ant-color-text)]!"
      >
        {icpRecord}
      </a>
      <Menu
        className="border-e-0!"
        items={menuItems}
        selectedKeys={selected}
        onClick={() => {
          onNavigate();
        }}
      />
    </Flex>
  );
}
