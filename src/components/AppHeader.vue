<script setup lang="ts">
import { h, computed } from 'vue'
import { useRoute } from 'vue-router'
import { IconDeviceDesktopDown, IconBrandGithubFilled, IconFileRssFilled } from '@tabler/icons-vue'
import { ModelContextProtocolIcon } from 'vue3-simple-icons'


// 深色模式
import { useDarkTheme } from '@/utils/useDarkTheme'
const { isDark } = useDarkTheme()

// 监听屏幕宽度变化
import { useScreenWidth } from '@/utils/useScreenWidth'
import { copyText } from '@/utils/copyText'
const { screenWidth } = useScreenWidth()

// 右侧按钮信息
const route = useRoute()
const buttonInfo = {
    mcp: {
        icon: h(ModelContextProtocolIcon),
        title: "MCP",
        url: `{
  "mcpServers": {
    "Hoyo Info MCP": {
      "url": "https://api.trrw.tech/mcp"
    }
  }
}`
    },
    pwa: {
        icon: h(IconDeviceDesktopDown),
        title: "保存到桌面",
        url: ""
    },
    rss: {
        icon: h(IconFileRssFilled),
        title: computed(() => `RSS订阅${route.params.game ? ' - ' + route.params.game : ''}`),
        url: computed(() => `${window.location.origin}/api/${route.params.game || 'index'}.xml`)
    },
    github: {
        icon: h(IconBrandGithubFilled),
        title: "GitHub",
        url: "https://github.com/Trrrrw/hoyo_video"
    }
}

// PWA 按钮点击
import { ref, onMounted, onUnmounted } from 'vue';
// 定义 BeforeInstallPromptEvent 类型（TS 默认库中没有这个类型）
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}
// 存储安装事件
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const showPWAButton = ref(false);
const handleBeforeInstallPrompt = (e: Event) => {
    // 阻止 Chrome 67 及更早版本自动显示提示
    e.preventDefault();
    // 保存事件以便稍后触发
    deferredPrompt.value = e as BeforeInstallPromptEvent;
    // 显示安装按钮
    showPWAButton.value = true;
};
const handleAppInstalled = () => {
    // 安装完成后隐藏按钮并清理事件
    showPWAButton.value = false;
    deferredPrompt.value = null;
    console.log('PWA 已成功安装');
};
// 执行安装逻辑
const installPWA = async () => {
    if (!deferredPrompt.value) return;
    // 显示安装确认弹窗
    await deferredPrompt.value.prompt();
    
    // 等待用户选择结果
    const { outcome } = await deferredPrompt.value.userChoice;
    console.log(`用户安装选择: ${outcome}`);
    // 不管结果如何，清理掉该事件，因为它只能使用一次
    deferredPrompt.value = null;
    showPWAButton.value = false;
};
onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
});
onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<template>
    <a-layout-header id="app-header"
        :style="{ paddingInline: screenWidth > 430 ? '50px' : '24px', backgroundColor: isDark ? '#141414' : '#ffffff' }">
        <a href="/" aria-label="影像档案架">
            <a-flex class="left-items" align="center" gap="small">
                <img src="@/assets/images/logo.webp" alt="影像档案架" style="height: 100%;" draggable="false"
                    fetchpriority="high" />
                <span v-if="screenWidth > 430">影像档案架</span>
            </a-flex>
        </a>
        <a-flex class="right-items" align="center" gap="small">
            <a-tooltip placement="bottom" :title="buttonInfo.mcp.title">
                <a-button type="text" :icon="buttonInfo.mcp.icon" key="2" :aria-label="buttonInfo.rss.title.value"
                    @click="copyText(buttonInfo.mcp.url, '已复制 MCP 配置')" />
            </a-tooltip>
            <a-tooltip v-if="showPWAButton" placement="bottom" :title="buttonInfo.pwa.title">
                <a-button type="text" :icon="buttonInfo.pwa.icon" key="3" :aria-label="buttonInfo.pwa.title"
                    @click="installPWA" />
            </a-tooltip>
            <a-tooltip placement="bottom" :title="buttonInfo.rss.title.value">
                <a-button type="text" :icon="buttonInfo.rss.icon" key="2" :aria-label="buttonInfo.rss.title.value"
                    @click="copyText(buttonInfo.rss.url.value, '已复制链接')" />
            </a-tooltip>
            <a-tooltip placement="bottom" :title="buttonInfo.github.title">
                <a-button type="text" :href="buttonInfo.github.url" target="_blank" :icon="buttonInfo.github.icon"
                    key="1" :aria-label="buttonInfo.github.title" />
            </a-tooltip>
        </a-flex>
    </a-layout-header>
</template>

<style lang="css" scoped>
svg {
    vertical-align: middle !important;
    height: 90%;
}

#app-header {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    z-index: 1;
}

.left-items {
    height: 100%;
    padding: 13px 0;
    cursor: pointer;
    float: left;
    line-height: 32px;
    font-size: 20px;
    font-weight: 600;
}

.right-items {
    height: 100%;
    float: right;
}
</style>