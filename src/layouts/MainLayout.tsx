import { Outlet } from "react-router";
import { Alert, Button, Layout } from "antd";
import AppHeader from "../components/AppHeader";
import AppSider from "../components/AppSider";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { useState } from "react";
import DownloadGuideModal from "../components/DownloadGuideModal";

dayjs.locale("zh-cn");

const { Content } = Layout;
const downloadGuideDismissedKey = "download-guide-dismissed-v1";

function isDownloadGuideBannerVisible() {
  try {
    return localStorage.getItem(downloadGuideDismissedKey) !== "true";
  } catch {
    return true;
  }
}

export default function MainLayout() {
  const [siderOpen, setSiderOpen] = useState(false);
  const [downloadGuideOpen, setDownloadGuideOpen] = useState(false);
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

  const openDownloadGuideFromBanner = () => {
    dismissDownloadGuideBanner();
    setDownloadGuideOpen(true);
  };

  return (
    <Layout className="h-dvh">
      <AppHeader
        siderOpen={siderOpen}
        onToggleSider={() => setSiderOpen((open) => !open)}
        onOpenDownloadGuide={() => setDownloadGuideOpen(true)}
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
        <AppSider
          mobileOpen={siderOpen}
          onMobileOpenChange={setSiderOpen}
        />

        <Content className="flex! min-h-0 min-w-0 overflow-hidden p-0">
          <Outlet />
        </Content>
      </Layout>

      <DownloadGuideModal
        open={downloadGuideOpen}
        onClose={() => setDownloadGuideOpen(false)}
      />
    </Layout>
  );
}
