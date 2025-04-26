<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from "vue"
import { useRoute } from "vue-router"
import MoreVideo from "../components/MoreVideo.vue"
import VideoActionButtons from "../components/VideoActionButtons.vue"
import { setMetaDescription } from "../utils/setMetaDescription"
import { navigateToSpecificType } from "../utils/routerHandlers"
import { updatePageTitleAndIcon } from "../utils/updatePageTitleAndIcon"
import { formatTitle } from "../utils/formatTitle"

const route = useRoute()
const game = computed(() => route.params.game)
const videoId = computed(() => route.query.id)
const data = ref(null)
const types = ref(null)
const config = ref(null)
const showOverlay = ref(false)
const returnType = ref(null)
const getReturnInfo = () => {
    const savedType = sessionStorage.getItem('returnType')
    returnType.value = savedType ? savedType : data.value[videoId.value].type[0] || ''
}

/** 动态导入 JSON 文件 */
const loadData = async () => {
    if (game.value && videoId.value) {
        try {
            const data_re = await import(`../data/${game.value}/data.json`)
            data.value = data_re.default
            const types_re = await import(`../data/${game.value}/types.json`)
            types.value = types_re.default
            const config_re = await import(`../data/${game.value}/config.json`)
            config.value = config_re.default
            setMetaDescription(`影像档案架 - ${data.value[videoId.value].title}`)
            getReturnInfo()
        } catch (error) {
            console.error("Failed to load data:", error)
        }
    }
}

watchEffect(() => {
    loadData()
    if (data.value) {
        updatePageTitleAndIcon(
            `${formatTitle(data.value[videoId.value].title, game.value, returnType.value)} | ${game.value}`,
            `../assets/icons/${game.value}.png`
        )
    }
})

const cleanupOldRecords = () => {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000) // 一个月前的时间戳
    const gameProgress = JSON.parse(localStorage.getItem(game.value) || '{}')

    // 过滤掉一个月前的记录
    const filteredProgress = Object.entries(gameProgress).reduce((acc, [videoId, data]) => {
        if (data.timestamp > oneMonthAgo) {
            acc[videoId] = data
        }
        return acc
    }, {})

    localStorage.setItem(game.value, JSON.stringify(filteredProgress))
}
const saveVideoProgress = (currentTime) => {
    if (game.value && videoId.value) {
        const gameProgress = JSON.parse(localStorage.getItem(game.value) || '{}')
        gameProgress[videoId.value] = {
            progress: currentTime,
            timestamp: Date.now()
        };
        localStorage.setItem(game.value, JSON.stringify(gameProgress))

        // 每次保存时检查并清理旧记录
        cleanupOldRecords()
    }
}
const getVideoProgress = () => {
    const gameProgress = JSON.parse(localStorage.getItem(game.value) || '{}')
    const currentTime = gameProgress[videoId.value]?.progress || 0
    const video = document.querySelector('video')
    // 如果视频已加载且历史进度超过90%，直接从头开始播放
    if (video && video.duration && currentTime > video.duration * 0.9) {
        currentTime = 0
    }
    if (currentTime !== 0) {
        showOverlay.value = true
    }
    return currentTime
}
const restartVideo = () => {
    const video = document.querySelector('video')
    if (video) {
        video.currentTime = 0
        video.play()
        showOverlay.value = false
    }
}

/** 判断是否是手机 */
const isMobileDevice = ref(false) // 改为 ref 而不是 computed

// 创建媒体查询监听
const mediaQuery = window.matchMedia('(max-width: 1200px)')
const updateDeviceStatus = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobileUA = /mobile|iP|android/.test(userAgent)
    isMobileDevice.value = isMobileUA || mediaQuery.matches
}

const handleTagClick = (tag) => {
    sessionStorage.removeItem('returnUrl')
    sessionStorage.removeItem('returnType')
    navigateToSpecificType(game.value, tag)
}

onMounted(() => {
    updateDeviceStatus()
    mediaQuery.addEventListener('change', updateDeviceStatus)
    setTimeout(() => {
        showOverlay.value = false
    }, 5000)
})

onUnmounted(() => {
    mediaQuery.removeEventListener('change', updateDeviceStatus)
})
</script>


<template>
    <h1 v-if="data && data[videoId]" style="display: none;">{{ `${data[videoId].title} | 影像档案架` }}</h1>
    <a-layout class="page-layout">
        <a-layout-content class="page-content">
            <a-flex vertical justify="center" align="flex-start">
                <div class="video-container">
                    <video v-if="data && data[videoId]" :key="data[videoId].src" controls autoplay
                        :poster="data[videoId].post" @timeupdate="(e) => saveVideoProgress(e.target.currentTime)"
                        @loadedmetadata="(e) => e.target.currentTime = getVideoProgress()"
                        style="width: 100%;height: auto;border: 1px solid rgba(5, 5, 5, 0.06);">
                        <source :src="data[videoId].src" :key="data[videoId].src" type="video/mp4">
                    </video>
                    <div v-if="showOverlay" class="video-overlay">
                        <a-button type="primary" @click="restartVideo"
                            @contextmenu="showOverlay = false">从头开始</a-button>
                    </div>
                </div>
                <h2 v-if="data && data[videoId] && !isMobileDevice" style="padding-top: 10px;">{{ data[videoId].title }}
                </h2>
                <h3 v-if="data && data[videoId] && isMobileDevice" style="padding-top: 10px;">{{ data[videoId].title }}
                </h3>
                <a-flex gap="small">
                    <p v-if="data && data[videoId]" style="height:100%;">{{ data[videoId].time }}</p>
                    <p v-if="data && data[videoId]">{{ data[videoId].intro }}</p>
                    <a-tag v-if="data && data[videoId]" v-for="tag in data[videoId].type" :bordered="false" color="blue"
                        style="height: fit-content;cursor: pointer;" @click="handleTagClick(tag)">{{ tag
                        }}</a-tag>
                </a-flex>
                <VideoActionButtons v-if="data && data[videoId] && config" :data="data" :videoId="videoId" :game="game"
                    :config="config" />
                <div style="width: 100%;">
                    <MoreVideo v-if="isMobileDevice" :data="data" :videoId="videoId" :types="types"
                        v-model:isMobileDevice="isMobileDevice" :returnType="returnType" />
                </div>
            </a-flex>
        </a-layout-content>
        <a-layout-sider v-if="!isMobileDevice" width="370" class="content-sider">
            <MoreVideo v-if="data && videoId && types && returnType" :data="data" :videoId="videoId" :types="types"
                v-model:isMobileDevice="isMobileDevice" :returnType="returnType" />
        </a-layout-sider>
    </a-layout>
</template>

<style scoped>
.page-content {
    line-height: 1 !important;
    height: initial;
    min-height: initial;
    line-height: initial;
}

.video-container {
    position: relative;
    width: 100%;
}

.video-overlay {
    position: absolute;
    left: 16px;
    top: 16px;
    z-index: 1;
}

.content-sider {
    background-color: white;
    border-inline-end: 1px solid rgba(5, 5, 5, 0.06);
    padding-right: 38px;
}
</style>