<script setup>
import { ref, computed, watchEffect } from "vue"
import { useRoute } from "vue-router"
import Card from "../components/Card.vue"
import { setMetaDescription } from "../utils/setMetaDescription"
import { navigateToSpecificType } from "../utils/routerHandlers"
import { updatePageTitleAndIcon } from "../utils/updatePageTitleAndIcon"

const route = useRoute()
const currentGame = computed(() => route.params.game)
const gameData = ref(null)
const videoTypesData = ref(null)
const videoTypeList = ref([])

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
            setMetaDescription(`影像档案架 - 整合${currentGame.value}的官方高清视频，支持视频分类、下载和 RSS 订阅`)
        } catch (error) {
            console.error("Failed to load data:", error)
        }
    }
}

watchEffect(() => {
    loadData()
    updatePageTitleAndIcon(`${currentGame.value} | 影像档案架`, `../assets/icons/${currentGame.value}.png`)
})   // 监听路由参数变化并重新加载数据
</script>

<template>
    <h1 style="display: none;">{{ `${currentGame} | 影像档案架` }}</h1>
    <a-layout class="page-layout">
        <a-layout-content class="page-content scrollable-container">
            <a-spin :delay="500" tip="Loading..." :spinning="!(gameData && videoTypesData)">
                <a-flex wrap="wrap" justify="flex-start" gap="middle">
                    <Card v-if="gameData" key="全部视频" :cover="Object.values(gameData)[0].post" title="全部视频"
                        @click="navigateToSpecificType(currentGame, '全部视频')" />
                    <Card v-for="item in (videoTypeList || [])" :key="item.type_name" :cover="item.post"
                        :title="item.type_name" @click="navigateToSpecificType(currentGame, item.type_name)" />
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