<script setup lang="ts">
import { computed, h, watch, watchEffect } from 'vue'
import MoreVideos from '@/components/MoreVideos.vue'
import DownloadDialog from '@/components/DownloadDialog.vue'
import { formatTitle } from '@/utils/textFormatter'
import { copyText } from '@/utils/copyText'
import { CalendarOutlined, YoutubeOutlined, LeftOutlined, DownloadOutlined, ShareAltOutlined, ExportOutlined } from "@ant-design/icons-vue"

// 深色模式
import { useDarkTheme } from '@/utils/useDarkTheme'
const { isDark } = useDarkTheme()

// 获取视频信息
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const videoID = computed(() => {
    return Number(route.query.id) || 0
})
const gameName = computed(() => route.params.game as string)
import { fetchVideoPlayCountList } from '@/utils/useData'
import { fetchVideoData } from '@/utils/useData'
import type { VideoInfo } from '@/utils/useData'
const videoInfo = ref<VideoInfo>()
const loadVideoData = async () => {
    if (videoID.value && gameName.value) {
        videoInfo.value = await fetchVideoData(videoID.value, gameName.value)
        // 播放量
        await fetchVideoPlayCountList([videoInfo.value])
    }
}
watch(
    [() => route.query.id, () => route.params.game],
    async () => {
        await loadVideoData()
    },
    { immediate: true }
)

// 设置页面头信息
import { useHead } from '@vueuse/head'
useHead(() => ({
    title: videoInfo.value ? `${videoInfo.value.title} - 影像档案架` : '影像档案架',
    meta: [
        {
            name: 'description',
            content: '整合原神、崩铁、绝区零的官网视频'
        }
    ]
}))

// 视频组件
import 'vidstack/player/styles/default/theme.css'
import 'vidstack/player/styles/default/layouts/audio.css'
import 'vidstack/player/styles/default/layouts/video.css'
import 'vidstack/player'
import 'vidstack/player/layouts'
import 'vidstack/player/ui'
import type { DefaultLayoutTranslations } from 'vidstack'
const CHINESE: DefaultLayoutTranslations = {
    'Caption Styles': '字幕样式',
    'Captions look like this': '字幕预览示例',
    'Closed-Captions Off': '关闭隐藏字幕',
    'Closed-Captions On': '开启隐藏字幕',
    'Display Background': '显示背景',
    'Enter Fullscreen': '进入全屏',
    'Enter PiP': '进入画中画',
    'Exit Fullscreen': '退出全屏',
    'Exit PiP': '退出画中画',
    'Google Cast': '投射到设备',
    'Keyboard Animations': '键盘动画',
    'Seek Backward': '后退',
    'Seek Forward': '前进',
    'Skip To Live': '跳转至直播',
    'Text Background': '文字背景',
    Accessibility: '辅助功能',
    AirPlay: 'AirPlay 投放',
    Announcements: '通知',
    Audio: '音频',
    Auto: '自动',
    Boost: '增强',
    Captions: '字幕',
    Chapters: '章节',
    Color: '颜色',
    Connected: '已连接',
    Connecting: '连接中',
    Continue: '继续',
    Default: '默认',
    Disabled: '已禁用',
    Disconnected: '已断开',
    Download: '下载',
    Family: '字体族',
    Font: '字体',
    Fullscreen: '全屏',
    LIVE: '直播',
    Loop: '循环',
    Mute: '静音',
    Normal: '正常',
    Off: '关闭',
    Opacity: '不透明度',
    Pause: '暂停',
    PiP: '画中画',
    Play: '播放',
    Playback: '播放',
    Quality: '画质',
    Replay: '重播',
    Reset: '重置',
    Seek: '跳转',
    Settings: '设置',
    Shadow: '阴影',
    Size: '大小',
    Speed: '速度',
    Text: '文字',
    Track: '轨道',
    Unmute: '取消静音',
    Volume: '音量',
}

const onVideoEnded = async () => {
    try {
        await fetch(`/api/game/video/count?game=${gameName.value}&video_id=${videoID.value}`, {
            method: 'POST',
        })
    } catch (err) {
        console.error('播放量更新失败', err)
    }
}


// TAG
import { useRouter } from 'vue-router'
const router = useRouter()
const onTagClick = (tag: string) => {
    router.push({
        name: 'VideoList',
        params: { game: gameName.value },
        query: {
            type: tag,
            page: 1,
            pageSize: 20,
        }
    })
}

// 简介折叠
const ellipsis = ref(true)
const introDisplay = computed(() => {
    const intro = videoInfo.value?.intro
    if (!intro) return ''
    if (ellipsis.value) {
        const shortIntro = intro.split('\n').slice(0, 2).join('\n')
        return shortIntro.length > 50 ? shortIntro.slice(0, 49) + '……' : shortIntro + '……'
    }
    return intro
})

// 功能按钮
// 返回
const returnUrl = sessionStorage.getItem('returnUrl') || '/'
// 下载
const modalVisible = ref(false)
const downloadButtonClick = async () => {
    modalVisible.value = true
}
// 分享
const absoluteUrl = window.location.href
// 官网
import { fetchGameList } from '@/utils/useData'
const onOfficialButtonClick = async () => {
    const games = await fetchGameList()
    games.map(info => {
        if (videoInfo.value && info.name == videoInfo.value.game) {
            const replacedURL = info.news_detail_url.replace('%id', videoInfo.value.id.toString())
            window.open(replacedURL, '_blank')
        }
    })
}

// 侧边栏
const showSider = ref(false)
import { useScreenWidth } from '@/utils/useScreenWidth'
const { screenWidth } = useScreenWidth()
const setSiderState = () => {
    if (screenWidth.value >= 1400)
        showSider.value = true
    else
        showSider.value = false
}
watchEffect(setSiderState)

// Waline
import { Waline } from '@waline/client/component'
import '@waline/client/style'
const serverURL = 'https://video-waline.trrw.tech'
const path = computed(() => useRoute().fullPath)
onMounted(() => {
    document.documentElement.style.setProperty('--waline-theme-color', '#1677ff')
    document.documentElement.style.setProperty('--waline-active-color', '#4096ff')
})
</script>

<template>
    <a-layout :style="{ backgroundColor: isDark ? '#141414' : '#ffffff' }">
        <a-layout-content :style="{ backgroundColor: isDark ? '#141414' : '#ffffff' }"
            style="padding: 24px; height: fit-content; padding-bottom: 24px;">
            <a-flex vertical gap="small">
                <media-player class="player" :title="videoInfo?.title" :src="videoInfo?.src" playsInline
                    @ended="onVideoEnded">
                    <media-provider>
                        <media-poster class="vds-poster" :src="videoInfo?.cover" :alt="videoInfo?.title" />
                    </media-provider>
                    <!-- Layouts -->
                    <media-audio-layout />
                    <media-video-layout :translations="CHINESE"
                        :download="{ url: videoInfo?.src!, filename: `${videoInfo?.title}.mp4` }" />
                </media-player>
                <a-typography-title :level="3" v-if="videoInfo" style="margin-bottom: 0;">
                    {{ formatTitle(videoInfo.title, videoInfo.game) }}
                </a-typography-title>
                <a-flex wrap>
                    <a-tag :bordered="false" :icon="h(CalendarOutlined)">
                        {{ videoInfo?.time }}
                    </a-tag>
                    <a-tag :bordered="false" :icon="h(YoutubeOutlined)">
                        {{ videoInfo?.play_count ?? 0 }}
                    </a-tag>
                    <a-tag v-for="tag in videoInfo?.type" :bordered="false" color="blue" style="cursor: pointer;"
                        @click="onTagClick(tag)">
                        {{ tag }}
                    </a-tag>
                </a-flex>
                <a-typography-paragraph>
                    <blockquote style="margin: initial; white-space: pre-line;">
                        {{ introDisplay }}
                        <a-typography-link @click="() => { ellipsis = !ellipsis }">
                            {{ ellipsis ? '展开' : '收起' }}
                        </a-typography-link>
                    </blockquote>
                </a-typography-paragraph>
                <a-flex gap="small" style="max-width: 100%;">
                    <a-button type="primary" :icon="h(LeftOutlined)" @click="$router.push(returnUrl)">返回</a-button>
                    <a-button :icon="h(DownloadOutlined)" @click="downloadButtonClick">下载</a-button>
                    <a-popover placement="bottom">
                        <template #content>
                            <a-qrcode :value="absoluteUrl" :color="isDark ? '#fff' : '#000'" :bordered="false" />
                        </template>
                        <a-button :icon="h(ShareAltOutlined)" @click="copyText(absoluteUrl, '已复制链接')">分享</a-button>
                    </a-popover>
                    <a-button :icon="h(ExportOutlined)" @click="onOfficialButtonClick">官网</a-button>
                </a-flex>
                <Waline :serverURL="serverURL" :path="path" :dark="isDark" style="width: 100%;" />
            </a-flex>
        </a-layout-content>
        <more-videos v-if="showSider && videoInfo" :game="gameName" :id="videoID" :types="videoInfo.type" />
        <download-dialog v-if="videoInfo" v-model:modalVisible="modalVisible" :videoInfo="videoInfo" />
    </a-layout>
</template>

<style lang="css" scoped>
.player {
    --brand-color: #f5f5f5;
    --focus-color: #4e9cf6;

    --audio-brand: var(--brand-color);
    --audio-focus-ring-color: var(--focus-color);
    --audio-border-radius: 2px;

    --video-brand: var(--brand-color);
    --video-focus-ring-color: var(--focus-color);
    --video-border-radius: 6px;
}

.player[data-view-type='audio'] media-poster {
    display: none;
}

.player[data-view-type='video'] {
    aspect-ratio: 16 /9;
}
</style>