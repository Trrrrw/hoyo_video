<script setup>
import { ref, computed, watchEffect, onMounted, onUnmounted } from "vue"
import { useRoute } from "vue-router"
import { EyeOutlined } from "@ant-design/icons-vue"
import MoreVideo from "../components/MoreVideo.vue"
import VideoActionButtons from "../components/VideoActionButtons.vue"
import { setMetaDescription } from "../utils/setMetaDescription"
import { navigateToSpecificType } from "../utils/routerHandlers"
import { updatePageTitleAndIcon } from "../utils/updatePageTitleAndIcon"
import { formatTitle } from "../utils/formatTitle"
import { setupVideoControls } from "../utils/videoControls"

const route = useRoute()
const currentGame = computed(() => route.params.game)
const videoId = computed(() => route.query.id)
const gameData = ref(null)
const videoTypesData = ref(null)
const gameConfig = ref(null)
const showOverlay = ref(false)
const returnType = ref(null)
const playCount = ref(0)
const playDuration = ref(0) // 累计播放时长(秒)
let playDurationInterval = null // 计时器
let lastPlayTime = 0 // 上次播放时间戳
const getReturnInfo = () => {
    const savedType = sessionStorage.getItem('returnType')
    returnType.value = savedType ? savedType : gameData.value[videoId.value].type[0] || ''
}

const setupPlayDurationTimer = (videoElement) => {
    setInterval(() => {
        if (!videoElement.paused) {
            playDuration.value += 1
        }
    }, 1000)
}

const getPlayCount = async () => {
    const url = `https://api.trrw.tech/play_count?game=${currentGame.value}&id=${videoId.value}`
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authx': 'zjmsvHt6XEapavfSjJU8bPcVQ5Gsbd'
    }
    try {
        const res = await fetch(url, { headers: headers })
        const responseData = await res.json()
        if (responseData.status == 'success') {
            playCount.value = responseData.data.play_count
        } else {
            console.error('Failed to fetch data:', error)
        }
    } catch (error) {
        console.error('Failed to fetch data:', error)
    }
}

const loadData = async () => {
    if (currentGame.value && videoId.value) {
        try {
            gameData.value = (await import(`../data/${currentGame.value}/data.json`)).default
            videoTypesData.value = (await import(`../data/${currentGame.value}/types.json`)).default
            gameConfig.value = (await import(`../data/${currentGame.value}/config.json`)).default
            setMetaDescription(`影像档案架 - ${gameData.value[videoId.value].title}`)
            getReturnInfo()
            getPlayCount()
        } catch (error) {
            console.error("Failed to load data:", error)
        }
    }
}

watchEffect(() => {
    loadData()
    if (gameData.value) {
        updatePageTitleAndIcon(
            `${formatTitle(gameData.value[videoId.value].title, currentGame.value, returnType.value)} | ${currentGame.value}`,
            `../assets/icons/${currentGame.value}.png`
        )
    }
})

const cleanupOldRecords = () => {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000) // 一个月前的时间戳
    const gameProgress = JSON.parse(localStorage.getItem(currentGame.value) || '{}')

    // 过滤掉一个月前的记录
    const filteredProgress = Object.entries(gameProgress).reduce((acc, [videoId, data]) => {
        if (data.timestamp > oneMonthAgo) {
            acc[videoId] = data
        }
        return acc
    }, {})

    localStorage.setItem(currentGame.value, JSON.stringify(filteredProgress))
}
const saveVideoProgress = async (currentTime) => {
    if (currentGame.value && videoId.value) {
        const video = document.querySelector('video')

        // 检查播放时长是否超过总时长的80%
        if (video && video.duration && playDuration.value > video.duration * 0.8) {
            const url = `https://api.trrw.tech/play_count`
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'authx': 'zjmsvHt6XEapavfSjJU8bPcVQ5Gsbd'
            }
            try {
                const res = await fetch(url, {
                    method: 'POST', headers: headers,
                    body: JSON.stringify({
                        video_id: videoId.value,
                        game_belongs_to: currentGame.value,
                        play_count: 1
                    })
                })
                const responseData = await res.json()
                console.log("播放量+1")
                playCount.value = responseData.play_count
            } catch (error) {
                console.error('Failed to fetch data:', error)
            }
            playDuration.value = 0 // 重置时长
        }

        const gameProgress = JSON.parse(localStorage.getItem(currentGame.value) || '{}')
        gameProgress[videoId.value] = {
            progress: currentTime,
            duration: playDuration.value,
            timestamp: Date.now()
        };
        localStorage.setItem(currentGame.value, JSON.stringify(gameProgress))

        // 每次保存时检查并清理旧记录
        cleanupOldRecords()
    }
}
const getVideoProgress = () => {
    const gameProgress = JSON.parse(localStorage.getItem(currentGame.value) || '{}')
    var currentTime = gameProgress[videoId.value]?.progress || 0
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
const isMobileDevice = ref(false)

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
    navigateToSpecificType(currentGame.value, tag)
}

let cleanupVideoControls = null
onMounted(() => {
    updateDeviceStatus()
    mediaQuery.addEventListener('change', updateDeviceStatus)

    setTimeout(() => {
        cleanupVideoControls = setupVideoControls(document.querySelector('video'))
        setupPlayDurationTimer(document.querySelector('video'))
    }, 500)

    setTimeout(() => {
        showOverlay.value = false
    }, 5000)
})

onUnmounted(() => {
    mediaQuery.removeEventListener('change', updateDeviceStatus)
    if (cleanupVideoControls) {
        cleanupVideoControls()
    }
})
</script>


<template>
    <h1 v-if="gameData && gameData[videoId]" style="display: none;">{{ `${gameData[videoId].title} | 影像档案架` }}</h1>
    <a-layout class="page-layout">
        <a-layout-content class="page-content">
            <a-flex vertical justify="center" align="flex-start">
                <div class="video-container">
                    <video v-if="gameData && gameData[videoId]" :key="gameData[videoId].src" controls autoplay
                        :poster="gameData[videoId].post"
                        @timeupdate="async (e) => await saveVideoProgress(e.target.currentTime)"
                        @loadedmetadata="(e) => e.target.currentTime = getVideoProgress()" @keydown.prevent
                        style="width: 100%;aspect-ratio: 16/9;border: 1px solid rgba(5, 5, 5, 0.06);outline: none;">
                        <source :src="gameData[videoId].src" :key="gameData[videoId].src" type="video/mp4">
                    </video>
                    <div v-if="showOverlay" class="video-overlay">
                        <a-button type="primary" @click="restartVideo"
                            @contextmenu="showOverlay = false">从头开始</a-button>
                    </div>
                </div>
                <h2 v-if="gameData && gameData[videoId] && !isMobileDevice" style="padding-top: 10px;">{{
                    gameData[videoId].title }}
                </h2>
                <h3 v-if="gameData && gameData[videoId] && isMobileDevice" style="padding-top: 10px;">{{
                    gameData[videoId].title }}
                </h3>
                <a-flex wrap style="margin-bottom: 2px;">
                    <a-tag v-if="gameData && gameData[videoId]" :bordered="false" style="height: fit-content;">{{
                        gameData[videoId].time }}</a-tag>
                    <a-tag v-if="gameData && gameData[videoId]" :bordered="false" style="height: fit-content;">
                        <template #icon>
                            <EyeOutlined />
                        </template>
                        {{ playCount }}
                    </a-tag>
                    <a-tag v-if="gameData && gameData[videoId]" v-for="tag in gameData[videoId].type" :bordered="false"
                        color="blue" style="height: fit-content;cursor: pointer;" @click="handleTagClick(tag)">{{ tag
                        }}</a-tag>
                </a-flex>
                <VideoActionButtons v-if="gameData && gameData[videoId] && gameConfig" :data="gameData"
                    :videoId="videoId" :game="currentGame" :config="gameConfig" />
                <div style="width: 100%;">
                    <MoreVideo v-if="isMobileDevice" :data="gameData" :videoId="videoId" :types="videoTypesData"
                        v-model:isMobileDevice="isMobileDevice" :returnType="returnType" />
                </div>
            </a-flex>
        </a-layout-content>
        <a-layout-sider v-if="!isMobileDevice" width="370" class="content-sider">
            <MoreVideo v-if="gameData && videoId && videoTypesData && returnType" :data="gameData" :videoId="videoId"
                :types="videoTypesData" v-model:isMobileDevice="isMobileDevice" :returnType="returnType" />
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
    background-color: black;
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