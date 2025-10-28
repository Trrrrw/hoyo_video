<script setup lang="ts">
import AppEmpty from '@/components/AppEmpty.vue'
import { ref, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// 获取游戏列表
import { fetchGameList } from "@/utils/useData"
const gameList = ref<string[]>([])
const selectedGame = ref(route.query.game as string || '')
onMounted(async () => {
    const games = await fetchGameList()
    gameList.value = (['全部游戏', ...games.sort((a, b) => a.weight - b.weight).map(g => g.name)])
})

// 搜索
import { searchVideos } from '@/utils/useData'
import type { VideoInfo } from '@/utils/useData'
import { scrollToPreviousPosition } from '@/utils/scrollHandler'
const loading = ref(false)
const searchValue = ref(route.query.q as string || '')
const searchResults = ref<VideoInfo[]>([])
const onSearch = async () => {
    if (!searchValue.value) return
    loading.value = true
    router.push({ path: '/search', query: { game: selectedGame.value, q: searchValue.value } })
    searchResults.value = await searchVideos(selectedGame.value, searchValue.value)
    loading.value = false
    await nextTick()
    setTimeout(() => scrollToPreviousPosition(), 50)
}
onMounted(onSearch)

// 深色模式
import { useDarkTheme } from '@/utils/useDarkTheme'
import VirtualGrid from '@/components/VirtualGrid.vue'
const { isDark } = useDarkTheme()
</script>

<template>
    <a-layout>
        <a-layout-header :class="isDark ? 'search-header-dark' : 'search-header-light'" class="search-header">
            <a-input-search id=" search-input" v-model:value="searchValue" size="large" @search="onSearch"
                style="width: 100%; max-width: 800px;">
                <template #addonBefore>
                    <a-select id="game-select" v-model:value="selectedGame" @change="onSearch" style="width: 140px">
                        <a-select-option v-for="game in gameList" :value="game">{{ game }}</a-select-option>
                    </a-select>
                </template>
            </a-input-search>
        </a-layout-header>
        <a-layout-content class="scrollable-container"
            :style="{ backgroundColor: isDark ? '#141414' : '#ffffff', padding: '24px' }">
            <a-spin tip="Loading..." :spinning="loading" :delay="200" style="width: 100%; height: 100vh;">
                <virtual-grid v-if="searchResults.length > 0" :items="searchResults" :show_badge="true" />
                <app-empty v-else-if="!loading" />
            </a-spin>
        </a-layout-content>
    </a-layout>
</template>

<style lang="css" scoped>
.search-header {
    padding-inline: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.search-header-light {
    background-color: #ffffff;
    border-bottom: 1px solid rgba(5, 5, 5, 0.06);
}

.search-header-dark {
    background-color: #141414;
    border-bottom: 1px solid rgba(253, 253, 253, 0.12);
}
</style>