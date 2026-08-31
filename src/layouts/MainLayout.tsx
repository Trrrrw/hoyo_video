import { Outlet } from "react-router";
import { Alert, Button, Layout } from "antd";
import AppHeader from "../components/AppHeader";
import { lazy, Suspense, useEffect, useState } from "react";

const { Content } = Layout;
const downloadGuideDismissedKey = "download-guide-dismissed-v1";
const desktopSiderMediaQuery = "(min-width: 768px)";
const AppSider = lazy(() => import("../components/AppSider"));
const DownloadGuideModal = lazy(
  () => import("../components/DownloadGuideModal"),
);

function isDownloadGuideBannerVisible() {
  try {
    return localStorage.getItem(downloadGuideDismissedKey) !== "true";
  } catch {
    return true;
  }
}

function useDesktopSider() {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia(desktopSiderMediaQuery).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopSiderMediaQuery);
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);

    updateIsDesktop();
    mediaQuery.addEventListener("change", updateIsDesktop);
    return () => mediaQuery.removeEventListener("change", updateIsDesktop);
  }, []);

  return isDesktop;
}

export default function MainLayout() {
  const [siderOpen, setSiderOpen] = useState(false);
  const [mobileSiderMounted, setMobileSiderMounted] = useState(false);
  const [downloadGuideOpen, setDownloadGuideOpen] = useState(false);
  const [downloadGuideMounted, setDownloadGuideMounted] = useState(false);
  const isDesktopSider = useDesktopSider();
  const [downloadGuideBannerVisible, setDownloadGuideBannerVisible] = useState(
    isDownloadGuideBannerVisible,
  );

  const dismissDownloadGuideBanner = () => {
    setDownloadGuideBannerVisible(false);
    try {
      localStorage.setItem(downloadGuideDismissedKey, "true");
    } catch {
      // The banner can still be dismissed for the current session
    }
  };

  const openDownloadGuide = () => {
    setDownloadGuideMounted(true);
    setDownloadGuideOpen(true);
  };

  const openDownloadGuideFromBanner = () => {
    dismissDownloadGuideBanner();
    openDownloadGuide();
  };

  const toggleSider = () => {
    if (!siderOpen) {
      setMobileSiderMounted(true);
    }
    setSiderOpen((open) => !open);
  };

  return (
    <Layout className="h-dvh">
      <AppHeader
        siderOpen={siderOpen}
        onToggleSider={toggleSider}
        onOpenDownloadGuide={openDownloadGuide}
      />

      {downloadGuideBannerVisible && (
        <Alert
          banner
          type="info"
          variant="filled"
          title="想下载视频？可使用视频卡片右侧菜单，或播放器右下角的下载按钮"
          action={
            <Button
              type="link"
              size="small"
              className="px-1! text-blue-700! dark:text-blue-300!"
              onClick={openDownloadGuideFromBanner}
            >
              查看方法
            </Button>
          }
          closable={{
            "aria-label": "关闭下载提示",
            onClose: dismissDownloadGuideBanner,
          }}
          className="shrink-0 border-x-0! border-t-0!"
        />
      )}

      <Layout className="flex-1! min-h-0 min-w-0">
        {(isDesktopSider || mobileSiderMounted) && (
          <Suspense fallback={null}>
            <AppSider
              mobileOpen={siderOpen}
              onMobileOpenChange={setSiderOpen}
            />
          </Suspense>
        )}

        <Content className="flex! min-h-0 min-w-0 overflow-hidden p-0">
          <Outlet />
        </Content>
      </Layout>

      {downloadGuideMounted && (
        <Suspense fallback={null}>
          <DownloadGuideModal
            open={downloadGuideOpen}
            onClose={() => setDownloadGuideOpen(false)}
          />
        </Suspense>
      )}
    </Layout>
  );
}
