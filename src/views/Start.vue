<script setup>
import { ref, reactive, watchEffect } from 'vue'
import { useRoute } from "vue-router"
import { setMetaDescription } from "../utils/setMetaDescription"
import { navigateToSearch } from "../utils/routerHandlers"
import { updatePageTitleAndIcon } from '../utils/updatePageTitleAndIcon'
import gamesListData from "../data/data.json"
import CorinImage from '../assets/images/可琳.webp'
import AnbyImage from '../assets/images/安比.webp'

const route = useRoute()
const gamesList = reactive(['全部游戏', ...gamesListData.games])
const selectedGame = ref(route.query.game || gamesList[0])
const gameData = ref({})
const searchResults = ref({})
const searchValue = ref(route.query.q || '')
const showFirstImage = ref(Math.floor(Date.now() / 1000) % 2 === 0)

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