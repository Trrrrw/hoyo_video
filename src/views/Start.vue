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
import CorinImage from '../assets/images/可琳.png'
import AnbyImage from '../assets/images/安比.png'

const route = useRoute()
const gamesList = reactive(['全部游戏', ...gamesListData.games])
const selectedGame = ref(route.query.game || gamesList[0])
const gameData = ref({})
const searchResults = ref({})
const loading = ref(false)
const searchValue = ref(route.query.q || '')
const showFirstImage = ref(Math.floor(Date.now() / 1000) % 2 === 0)


const loadData = async () => {
    try {
        if (selectedGame.value === '全部游戏') {
            for (const game of gamesListData.games) {
                try {
                    const data = (await import(`../data/${game}/data.json`)).default
                    Object.entries(data).forEach(([id, item]) => {
                        data[id] = { ...item, game }
                    })
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
    console.log("onSearch")
    if (!searchValue.value) {
        searchResults.value = {}
        return
    }
    navigateToSearch(selectedGame.value, searchValue.value)
}

watchEffect(() => {
    updatePageTitleAndIcon('影像档案架', '/favicon.ico')
    setMetaDescription('影像档案架')
})
</script>

<template>
    <a-layout class="page-layout">
        <a-layout-content class="page-content scrollable-container">
            <a-flex vertical align="center" justify="center" style="height: 100%;">
                <img v-if="showFirstImage" :src="CorinImage" height="25%" />
                <img v-else :src="AnbyImage" height="25%" />
                <a-input-search class="search-input" v-model:value="searchValue" size="large" @search="onSearch">
                    <template #addonBefore>
                        <a-select v-model:value="selectedGame" @change="onSearch" style="width: 140px">
                            <a-select-option v-for="game in gamesList" :value="game">{{ game }}</a-select-option>
                        </a-select>
                    </template>
                </a-input-search>
            </a-flex>
        </a-layout-content>
    </a-layout>
</template>

<style scoped>
.page-content {
    margin: 30px 0 120px 0;
}
</style>