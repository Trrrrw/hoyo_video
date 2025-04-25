<script setup>
import { ref, reactive, watchEffect } from 'vue'
import Card from "../components/Card.vue"
import { setMetaDescription } from "../utils/setMetaDescription"
import { navigateToSpecificGame, navigateToVideo } from "../utils/routerHandlers"
import gamesListData from "../data/data.json"
import { updatePageTitleAndIcon } from '../utils/updatePageTitleAndIcon'


const gamesList = reactive(gamesListData.games)
const getIconPath = game => {
    return new URL(`../assets/icons/${game}.png`, import.meta.url).href
}
const gamesData = ref({})

/** 导入 JSON 文件 */
const loadData = async () => {
    setMetaDescription(`影像档案架 - 整合原神、崩铁、绝区零的官方高清视频，支持视频分类、下载和 RSS 订阅`)
    try {
        const allData = {}
        for (const game of gamesList) {
            try {
                const data = (await import(`../data/${game}/data.json`)).default
                // 获取最后5个数据项，添加id并按time排序
                const latestItems = Object.entries(data)
                    .slice(-5)
                    .map(([id, item]) => ({
                        ...item, id, game,
                        title: item.title
                            .replace(`《${game}》——`, '')
                            .replace(`《${game}》`, '')
                            .trim()
                    }))
                    .sort((a, b) => new Date(b.time) - new Date(a.time))

                // 按游戏名分组存储为数组
                allData[game] = latestItems
            } catch (error) {
                console.error(`Failed to load data for ${game}:`, error)
            }
        }
        gamesData.value = allData
    } catch (error) {
        console.error("Failed to load data:", error)
    }
}

/** 处理卡片的点击 */
const handleCardClick = (item) => {
    sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search)
    navigateToVideo(item.game, item.id)
}

watchEffect(() => {
    loadData()
    updatePageTitleAndIcon('影像档案架', '/favicon.ico')
})
</script>

<template>
    <h1 style="display: none;">影像档案架</h1>
    <a-layout class="page-layout">
        <a-layout-content class="page-content scrollable-container">
            <a-flex vertical gap="small">
                <a-card v-for="game in gamesList">
                    <a-card-meta :title="game" @click="navigateToSpecificGame(game)" style="cursor: pointer;">
                        <template #avatar>
                            <a-avatar :src="getIconPath(game)" style="border-radius: 0;" />
                        </template>
                    </a-card-meta>
                    <a-divider />
                    <a-flex v-if="gamesData && gamesData[game]" class="scrollable-container" wrap="wrap"
                        justify="flex-start" gap="middle" style="padding: 0 10px 10px 10px;text-align: center;">
                        <Card v-for="(item, index) in (gamesData[game] || [])" :key="item.post" :cover="item.post"
                            :title="item.title" :badge="index == 0 ? 'New!' : ''" badgeColor="red"
                            :description="item.time" @click="handleCardClick(item)" />
                    </a-flex>
                </a-card>
            </a-flex>
        </a-layout-content>
    </a-layout>
</template>

<style scoped>
.page-layout {
    height: 100%;
    background: none;
}

.page-content {
    height: 100%;
    min-height: 120;
    padding: 24px 24px 0 24px;
    line-height: 120px;
    text-align: start;
}

.scrollable-container {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.scrollable-container::-webkit-scrollbar {
    display: none;
}

.scrollable-container {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}
</style>