<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 设置页面头信息
import { useHead } from '@vueuse/head'
useHead({
    title: '首页 - 影像档案架',
    meta: [
        {
            name: 'description',
            content: '整合原神、崩铁、绝区零的官网视频'
        }
    ]
})

// 随机显示图片
const images = import.meta.glob('@/assets/images/home_logo/*', { eager: true })
const imageList = Object.values(images).map((mod: any) => mod.default)
const randomImage = ref(imageList[Math.floor(Math.random() * imageList.length)])

// 获取游戏列表
import { fetchGameList } from "@/utils/useData"
const gameList = ref<string[]>([])
const selectedGame = ref('')
onMounted(async () => {
    const games = await fetchGameList()
    gameList.value = (['全部游戏', ...games.sort((a, b) => a.weight - b.weight).map(g => g.name)])
    selectedGame.value = gameList.value[0] || ''
})

// 搜索
const searchValue = ref('')
const router = useRouter()
const onSearch = () => {
    if (!searchValue.value) return
    router.push({ path: '/search', query: { game: selectedGame.value, q: searchValue.value } })
}
</script>

<template>
    <div style="position: relative; width: 100%; height: 100%;">
        <a-flex vertical align="center" justify="center" class="search-center">
            <img :src="randomImage" alt="Home loge" height="200px" draggable="false" />
            <a-input-search id="search-input" v-model:value="searchValue" size="large" @search="onSearch"
                style="max-width: 1200px;">
                <template #addonBefore>
                    <a-select id="game-select" v-model:value="selectedGame" style="width: 140px">
                        <a-select-option v-for="game in gameList" :value="game">{{ game }}</a-select-option>
                    </a-select>
                </template>
            </a-input-search>
        </a-flex>
    </div>
</template>

<style lang="css" scoped>
.search-center {
    padding: 24px;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 1200px;
}
</style>