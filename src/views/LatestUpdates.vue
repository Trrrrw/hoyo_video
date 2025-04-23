<script setup>
import Card from "../components/Card.vue"
import gamesListData from "../data/data.json"
import { ref, reactive, watchEffect } from 'vue'
import { useRouter } from "vue-router"
import { setMetaDescription } from "../utils/setMetaDescription"

const router = useRouter()

const gamesList = reactive(gamesListData.games)
const getIconPath = game => {
    return new URL(`../assets/icons/${game}.png`, import.meta.url).href
}
const gamesData = ref({})

/** 设置页面标题和图标 */
const setPageIcon = () => {
    document.title = `影像档案架`// 设置页面标题
    // 设置页面图标
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
    link.rel = 'icon'
    link.href = './favicon.ico'
    document.head.appendChild(link)
    setMetaDescription()
}

/** 导入 JSON 文件 */
const loadData = async () => {
    setPageIcon()
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
    sessionStorage.setItem('returnUrl', router.currentRoute.value.fullPath)
    router.push({ path: `/${item.game}/video`, query: { id: item.id } })
}

/** 处理游戏标题点击 */
const handleGameTitleClick = (game) => {
    router.push({ path: `/${game}` })
}

watchEffect(loadData)   // 监听路由参数变化并重新加载数据
</script>

<template>
    <h1 style="display: none;">影像档案架</h1>
    <a-layout class="page-layout">
        <a-layout-content class="page-content scrollable-container">
            <a-flex vertical gap="small">
                <a-card v-for="game in gamesList">
                    <a-card-meta :title="game" @click="handleGameTitleClick(game)" style="cursor: pointer;">
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