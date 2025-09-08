<script setup>
import { ref, reactive, watchEffect } from 'vue'
import Card from "../components/Card.vue"
import { setMetaDescription } from "../utils/setMetaDescription"
import { navigateToSpecificGame, navigateToVideo } from "../utils/routerHandlers"
import { updatePageTitleAndIcon } from '../utils/updatePageTitleAndIcon'
import { formatTitle } from '../utils/formatTitle'
import gamesListData from "../data/data.json"


const gamesList = reactive(gamesListData.games)
const getIconPath = game => {
    return new URL(`../assets/icons/${game}.png`, import.meta.url).href
}
const gamesData = ref({})

/** 导入 JSON 文件 */
const loadData = async () => {
    setMetaDescription(`影像档案架 - 整合原神、崩坏：星穹铁道、绝区零的官方高清视频，支持视频分类、下载和 RSS 订阅`)
    try {
        const allData = {}
        for (const game of gamesList) {
            try {
                const data = (await import(`../data/${game}/data.json`)).default
                // 获取最后5个数据项，添加id并按time排序
                const latestItems = Object.entries(data)
                    .slice(-5)
                    .map(([id, item]) => {
                        const cleanTitle = formatTitle(item.title, game)
                        return {
                            ...item, id, game,
                            title: cleanTitle,
                        }
                    })
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
            <a-spin :delay="500" :spinning="!gamesData">
                <a-flex vertical gap="small">
                    <a-card v-for="game in gamesList">
                        <template #title>
                            <a-avatar :src="getIconPath(game)" shape="square" />
                            {{ game }}
                        </template>
                        <template #extra><a @click="navigateToSpecificGame(game)">更多视频</a></template>
                        <a-flex v-if="gamesData && gamesData[game]" class="scrollable-container" wrap="wrap"
                            justify="flex-start" gap="middle" style="padding: 0 10px 10px 10px;text-align: center;">
                            <Card v-for="(item, index) in (gamesData[game] || [])" :key="item.post" :cover="item.post"
                                :game="game" :video_id="Number(item.id)" :title="item.title"
                                :badge="index == 0 ? 'New!' : ''" badgeColor="red" :description="item.time"
                                @click="handleCardClick(item)" />
                        </a-flex>
                    </a-card>
                </a-flex>
            </a-spin>
        </a-layout-content>
    </a-layout>
</template>

<style scoped>
.page-content {
    text-align: start;
}
</style>