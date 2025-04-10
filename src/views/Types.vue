<script setup>
import Card from "../components/Card.vue"
import { ref, computed, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const currentGame = computed(() => route.params.game)
const gameData = ref(null)
const videoTypesData = ref(null)
const videoTypeList = ref([])
const iconPath = computed(() => {
    return new URL(`../assets/icons/${currentGame.value}.png`, import.meta.url).href
})

/** 设置页面标题和图标 */
const setPageIcon = () => {
    document.title = `${currentGame.value} | 影像档案架`// 设置页面标题
    // 设置页面图标
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
    link.rel = 'icon'
    link.href = iconPath.value
    document.head.appendChild(link)
}

/** 导入 JSON 文件 */
const loadData = async () => {
    if (currentGame.value) {
        try {
            gameData.value = (await import(`../data/${currentGame.value}/data.json`)).default
            videoTypesData.value = (await import(`../data/${currentGame.value}/types.json`)).default
            videoTypeList.value = Object.entries(videoTypesData.value)
                .filter(([_, ids]) => ids.length > 0)  // 过滤掉空数组
                .map(([video_type, ids]) => ({
                    type_name: video_type,
                    post: gameData.value[ids[0]].post
                }))
            setPageIcon()
        } catch (error) {
            console.error("Failed to load data:", error)
        }
    }
}

/** 处理卡片的点击 */
const handleCardClick = (video_type) => {
    router.push({
        name: 'Videos',
        params: { game: currentGame.value },
        query: { type: video_type, page: 1, pageSize: 20 }
    })
}

watchEffect(loadData)   // 监听路由参数变化并重新加载数据
</script>

<template>
    <a-layout class="page-layout">
        <a-layout-content class="page-content scrollable-container">
            <a-spin delay="500" tip="Loading..." :spinning="!(gameData && videoTypesData)">
                <a-flex wrap="wrap" justify="flex-start" gap="middle">
                    <Card v-for="item in (videoTypeList || [])" :key="item.post" :cover="item.post"
                        :title="item.type_name" @click="handleCardClick(item.type_name)" />
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

.page-content {
    height: 100%;
    min-height: 120;
    padding: 24px 24px 0 24px;
    line-height: 120px;
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