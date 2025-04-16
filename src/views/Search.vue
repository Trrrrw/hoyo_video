<script setup>
import Card from "../components/Card.vue"
import gamesListData from "../data/data.json"
import { ref, reactive, watchEffect, watch } from 'vue'
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const gamesList = reactive(['全部游戏', ...gamesListData.games])
const selectedGame = ref(route.query.game || gamesList[0])
const gameData = ref(null)
const searchResults = ref([])
const loading = ref(false)
const searchValue = ref(route.query.q || '')

/** 设置页面标题和图标 */
const setPageIcon = () => {
    document.title = `搜索 | 影像档案架`// 设置页面标题
    // 设置页面图标
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
    link.rel = 'icon'
    link.href = './favicon.ico'
    document.head.appendChild(link)
}

/** 导入 JSON 文件 */
const loadData = async () => {
    try {
        if (selectedGame.value === '全部游戏') {
            // 导入所有游戏数据并合并
            const allData = {}
            for (const game of gamesListData.games) {
                try {
                    const data = (await import(`../data/${game}/data.json`)).default
                    Object.entries(data).forEach(([id, item]) => {
                        data[id] = { ...item, game }
                    })
                    Object.assign(allData, data)
                } catch (error) {
                    console.error(`Failed to load data for ${game}:`, error)
                }
            }
            gameData.value = allData
        } else {
            // 导入单个游戏数据
            const data = (await import(`../data/${selectedGame.value}/data.json`)).default
            Object.entries(data).forEach(([id, item]) => {
                data[id] = { ...item, game: selectedGame.value }
            })
            gameData.value = data
        }
    } catch (error) {
        console.error("Failed to load data:", error)
    }
}

const onSearch = async _ => {
    if (!searchValue.value) {
        searchResults.value = []
        return
    }
    loading.value = true
    await loadData()
    if (gameData.value) {
        searchResults.value = Object.entries(gameData.value || {})
            .filter(([id, item]) => {
                const keywords = searchValue.value.toLowerCase().split(/\s+/).filter(Boolean)
                if (keywords.length === 0) return false

                const title = item.title.toLowerCase()
                return keywords.every(keyword => title.includes(keyword))
            })
            .map(([id, item]) => {
                // 处理标题，删除游戏名称相关的字符串
                const game = item.game || '';
                const cleanTitle = item.title
                    .replace(`《${game}》——`, '') // 游戏名带双破折号
                    .replace(`《${game}》`, '') // 游戏名
                    .trim();

                return {
                    id,
                    ...item,
                    title: cleanTitle
                };
            })
    }

    loading.value = false
}

/** 处理卡片的点击 */
const handleCardClick = (item) => {
    sessionStorage.setItem('returnUrl', router.currentRoute.value.fullPath)
    router.push({ path: `/${item.game}/video`, query: { id: item.id } })
}

watchEffect([setPageIcon, onSearch])   // 监听路由参数变化并设置图标
watch([selectedGame, searchValue], () => {
    const query = {
        game: selectedGame.value,
        ...(searchValue.value && { q: searchValue.value })
    }
    router.push({ path: `/search`, query })
})
</script>

<template>
    <a-layout class="page-layout">
        <a-layout-header class="page-header">
            <a-flex vertical>
                <a-input-search class="header-content" v-model:value="searchValue" size="large" @search="onSearch"
                    @change="onSearch">
                    <template #addonBefore>
                        <a-select v-model:value="selectedGame" @change="onSearch" style="width: 140px">
                            <a-select-option v-for="game in gamesList" :value="game">{{ game }}</a-select-option>
                        </a-select>
                    </template>
                </a-input-search>
            </a-flex>
        </a-layout-header>
        <a-layout-content class="page-content scrollable-container">
            <a-empty v-if="searchResults.length == 0" />
            <a-spin :delay="500" tip="Loading..." :spinning="loading">
                <a-flex wrap="wrap" justify="flex-start" gap="middle">
                    <Card v-for="item in (searchResults || [])" :key="item.post" :cover="item.post" :title="item.title"
                        :badge="selectedGame == '全部游戏' ? item.game : ''" @click="handleCardClick(item)" />
                </a-flex>
            </a-spin>
        </a-layout-content>
    </a-layout>
</template>

<style scoped>
.page-layout {
    height: 100%;
    background: none;
}

.page-header {
    padding-inline: 0;
    line-height: 64px;
    background-color: transparent;
    height: fit-content;
    padding-bottom: 10px;
}

.page-content {
    height: 100%;
    min-height: 120;
    line-height: 120px;
    padding: 24px 24px 0 24px;
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

.header-content {
    padding-top: 30px;
    width: 80%;
    margin: auto;
}
</style>