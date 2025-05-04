<script setup>
import { ref, reactive, watchEffect, watch, nextTick } from 'vue'
import { useRoute } from "vue-router"
import Card from "../components/Card.vue"
import { setMetaDescription } from "../utils/setMetaDescription"
import { scrollToPreviousPosition } from "../utils/scrollHandlers"
import { navigateToSearch, navigateToVideo } from "../utils/routerHandlers"
import { updatePageTitleAndIcon } from '../utils/updatePageTitleAndIcon'
import { formatTitle } from '../utils/formatTitle'
import gamesListData from "../data/data.json"

const route = useRoute()
const gamesList = reactive(['全部游戏', ...gamesListData.games])
const selectedGame = ref(route.query.game || gamesList[0])
const gameData = ref({})
const searchResults = ref({})
const loading = ref(false)
const searchValue = ref(route.query.q || '')

const loadData = async () => {
    try {
        if (selectedGame.value === '全部游戏') {
            for (const game of gamesListData.games) {
                try {
                    const data = (await import(`../data/${game}/data.json`)).default
                    Object.entries(data).forEach(([id, item]) => {
                        data[id] = { ...item, game }
                    })
                    console.log(game)
                    gameData.value[game] = data
                } catch (error) {
                    console.error(`Failed to load data for ${game}:`, error)
                }
            }
        } else {
            const data = (await import(`../data/${selectedGame.value}/data.json`)).default
            Object.entries(data).forEach(([id, item]) => {
                data[id] = { ...item, game: selectedGame.value }
            })
            gameData.value = { [selectedGame.value]: data }
        }
    } catch (error) {
        console.error("Failed to load data:", error)
    }
}

const onSearch = async _ => {
    if (!searchValue.value) {
        searchResults.value = {}
        return
    }
    loading.value = true
    await loadData()
    if (gameData.value) {
        searchResults.value = JSON.parse(JSON.stringify(gameData.value))
        for (const game in searchResults.value) {
            const filteredData = Object.entries(searchResults.value[game])
                .filter(([id, item]) => {
                    const keywords = searchValue.value.toLowerCase().split(/\s+/).filter(Boolean)
                    if (keywords.length === 0) return false

                    const title = item.title.toLowerCase()
                    return keywords.every(keyword => title.includes(keyword))
                })
                .map(([id, item]) => {
                    const cleanTitle = formatTitle(item.title, item.game)
                    return [id, { ...item, title: cleanTitle }]
                })
            searchResults.value[game] = Object.fromEntries(filteredData)
        }
    }

    loading.value = false
    nextTick(() => {
        setTimeout(scrollToPreviousPosition('#app > section > section > section > main > section > main'), 50)
    })
}

/** 处理卡片的点击 */
const handleCardClick = (item) => {
    sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search)
    const scrollContainer = document.querySelector('#app > section > section > section > main > section > main')
    sessionStorage.setItem('scrollPosition', scrollContainer.scrollTop)
    navigateToVideo(item.game, item.id)
}

watchEffect(() => {
    updatePageTitleAndIcon('搜索 | 影像档案架', '/favicon.ico')
    onSearch()
    setMetaDescription('搜索 | 影像档案架')
})
watch([selectedGame, searchValue], () => {
    navigateToSearch(selectedGame.value, searchValue.value)
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
            <a-empty v-if="searchResults.length == 0 && !loading" />
            <a-spin :delay="500" tip="Loading..." :spinning="loading">
                <a-flex wrap="wrap" justify="flex-start" gap="middle">
                    <Card
                        v-for="item in (Object.values(searchResults).map(game => Object.values(game).reverse()).flat() || [])"
                        :key="item.post" :cover="item.post" :title="item.title"
                        :badge="selectedGame == '全部游戏' ? item.game : ''" :description="item.time"
                        @click="handleCardClick(item)" />
                </a-flex>
            </a-spin>
        </a-layout-content>
    </a-layout>
</template>

<style scoped>
.page-header {
    padding-inline: 0;
    line-height: 64px;
    background-color: transparent;
    height: fit-content;
    padding-bottom: 10px;
}

.header-content {
    padding-top: 30px;
    width: 80%;
    margin: auto;
}
</style>