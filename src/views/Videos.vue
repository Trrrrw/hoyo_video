<script setup>
import Card from "../components/Card.vue"
import TopMenuBar from "../components/TopMenuBar.vue"
import { formatTitle } from "../utils/formatTitle"
import { ref, computed, watchEffect, watch, h } from "vue"
import { useRoute, useRouter } from "vue-router"
import { LeftOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const currentGame = computed(() => route.params.game)
const currentType = computed(() => route.query.type)
const gameData = ref(null)
const videoTypesData = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)
const iconPath = computed(() => {
    return new URL(`../assets/icons/${currentGame.value}.png`, import.meta.url).href
})

/** 设置页面标题和图标 */
const setPageIcon = () => {
    document.title = `${currentType.value} | ${currentGame.value}`// 设置页面标题
    // 设置页面图标
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
    link.rel = 'icon'
    link.href = iconPath.value
    document.head.appendChild(link)
}

/** 导入 JSON 文件 */
const loadData = async () => {
    if (currentGame.value && currentType.value) {
        try {
            gameData.value = (await import(`../data/${currentGame.value}/data.json`)).default
            videoTypesData.value = (await import(`../data/${currentGame.value}/types.json`)).default
            setPageIcon()
        } catch (error) {
            console.error("Failed to load data:", error)
        }
    }
}

const contentRef = ref(null)
const scrollToTop = () => {
    if (contentRef.value?.$el) {
        contentRef.value.$el.scrollTo({ top: 0 })
    }
}

/** 处理卡片的点击 */
const handleCardClick = (videoId) => {
    router.push({ path: `/${currentGame.value}/video`, query: { id: videoId } })
}

/** 点击图标返回上级 */
const goBack = () => {
    router.push({ path: `/${currentGame.value}` })
}

/** 格式化卡片标题 */
const formatTitleComputed = computed(() => {
    if (!gameData.value || !videoTypesData.value) return ''
    return (itemId) => formatTitle(
        gameData.value[itemId].title,
        currentGame.value,
        currentType.value
    )
})

watchEffect(loadData)   // 监听路由参数变化并重新加载数据
watch([currentPage, pageSize], scrollToTop) // 监听分页参数变化并滚动到顶部
</script>

<template>
    <a-layout class="page-layout">
        <a-layout class="page-layout">
            <a-layout-header class="page-header">
                <a-flex align="center" style="padding-left: 5px;">
                    <a-button :icon="h(LeftOutlined)" @click="goBack"></a-button>
                    <TopMenuBar />
                </a-flex>
            </a-layout-header>
            <a-layout-content ref="contentRef" class="page-content scrollable-container">
                <a-spin delay="500" tip="Loading..." :spinning="!(gameData && videoTypesData)">
                    <a-flex wrap="wrap" justify="flex-start" gap="middle">
                        <Card
                            v-for="itemId in (videoTypesData[currentType] || []).slice((currentPage - 1) * pageSize, currentPage * pageSize)"
                            v-if="gameData && videoTypesData" :key="itemId" :cover="gameData[itemId].post"
                            :title="formatTitleComputed(itemId)" @click="handleCardClick(itemId)" />
                    </a-flex>
                </a-spin>
            </a-layout-content>
            <a-layout-footer class="pagination">
                <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" show-size-changer
                    :total="videoTypesData && currentType ? videoTypesData[currentType].length : 0" />
            </a-layout-footer>
        </a-layout>
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

.pagination {
    background-color: transparent;
}
</style>