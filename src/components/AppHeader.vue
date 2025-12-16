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
    "hoyo-info": {
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
const showPWAButton = ref<boolean>(false)
let deferredPrompt: any = null
onMounted(() => {
    // 监听浏览器触发安装事件
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault() // 阻止浏览器自动弹出安装提示
        deferredPrompt = e // 缓存事件
        showPWAButton.value = true // 显示“安装”按钮
    })

    // 如果 PWA 已安装，隐藏按钮
    window.addEventListener('appinstalled', () => {
        showPWAButton.value = false
        deferredPrompt = null
        console.log('✅ PWA 已安装')
    })
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', () => { })
    window.removeEventListener('appinstalled', () => { })
})

const onPWAClick = async () => {
    if (!deferredPrompt) {
        console.warn('❌ 当前不支持 PWA 安装或已安装。')
        return
    }

    // 调用浏览器安装提示
    deferredPrompt.prompt()

    // 等待用户选择
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
        console.log('🎉 用户接受安装 PWA')
    } else {
        console.log('🙅 用户拒绝安装 PWA')
    }

    // 清理状态
    deferredPrompt = null
    showPWAButton.value = false
}
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
                    @click="onPWAClick" />
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