<script setup lang="ts">
import { computed, h, ref, watch, watchEffect, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LeftOutlined } from '@ant-design/icons-vue'
import VirtualGrid from '@/components/VirtualGrid.vue'
const route = useRoute()
const router = useRouter()

// 设置页面头信息
import { useHead } from '@vueuse/head'
const pageTitle = computed(() => `${route.query.type} - ${route.params.game} - 影像档案架`)
useHead({
    title: pageTitle,
    meta: [
        {
            name: "description",
            content: `${route.params.game} - ${route.query.type}视频合集`
        }
    ]
})

// 获取视频类型列表
import { fetchTypeList } from '@/utils/useData'
import type { TypeInfo } from '@/utils/useData'
const typeList = ref<TypeInfo[]>([])
const getTypeList = async () => {
    if (route.params.game) {
        typeList.value = await fetchTypeList(route.params.game as string)
    }
}
watchEffect(getTypeList)

// 顶部菜单选项
import type { MenuItem } from '@/utils/menuItem'
const menuItems = computed<MenuItem[]>(() => {
    return typeList.value.map(item => ({
        label: item.type_name,
        icon: null,
        children: null,
        key: item.type_name,
        type: null
    }))
})
const selectedType = ref(route.query.type ? [route.query.type] : [])
const onMenuSelect = (info: { key: string; keyPath: string[]; selectedKeys: string[] }) => {
    scrollToTop(scrollableContainerRef.value, true)
    selectedType.value = info.selectedKeys
    currentPage.value = 1
    router.push({
        name: 'VideoList',
        params: { game: route.params.game },
        query: { type: info.key, page: '1', pageSize: route.query.pageSize || '20' }
    })
}


// 获取视频总数
const totalVideos = ref(0)
// 获取分类下视频列表
import { fetchVideoList } from '@/utils/useData'
import type { VideoInfo } from '@/utils/useData'
import { scrollToPreviousPosition } from '@/utils/scrollHandler'
const loading = ref(false)
const videoList = ref<VideoInfo[]>([])
const getTotalVideoList = async () => {
    if (route.params.game && route.query.type && route.query.page && route.query.pageSize) {
        loading.value = true
        try {
            const { total, video_list } = await fetchVideoList(
                route.params.game as string,
                route.query.type as string,
                parseInt(route.query.page as string),
                parseInt(route.query.pageSize as string)
            )
            totalVideos.value = total
            videoList.value = video_list
        } finally {
            loading.value = false
            await nextTick()
            setTimeout(() => scrollToPreviousPosition(), 50)
        }
    }
}
watchEffect(getTotalVideoList)

// Pagination 分页
import { scrollToTop } from '@/utils/scrollHandler'
const currentPage = ref(parseInt(route.query.page as string) || 1)
const pageSize = ref(parseInt(route.query.pageSize as string) || 20)
const scrollableContainerRef = ref(null)
watch([currentPage, pageSize], ([newPage, newSize]) => {
    currentPage.value = newPage
    pageSize.value = newSize
    router.push({
        name: 'VideoList',
        params: { game: route.params.game },
        query: {
            ...route.query,
            page: newPage,
            pageSize: newSize
        }
    })
    scrollToTop(scrollableContainerRef.value)
})

// 返回按钮
const onBack = () => {
    router.push(
        { name: 'VideoCategory', params: { game: route.params.game } }
    )
}

// 深色模式
import { useDarkTheme } from '@/utils/useDarkTheme'
const { isDark } = useDarkTheme()
</script>

<template>
    <a-layout>
        <a-layout-header :class="isDark ? 'video-list-header-dark' : 'video-list-header'">
            <a-flex align="center">
                <a-button :icon="h(LeftOutlined)" @click="onBack" />
                <a-menu mode="horizontal" :items="menuItems" v-model:selectedKeys="selectedType" @click="onMenuSelect"
                    style="width: 100%; height: 100%;" />
            </a-flex>
        </a-layout-header>
        <a-layout-content ref="scrollableContainerRef" class="scrollable-container"
            :style="{ backgroundColor: isDark ? '#141414' : '#ffffff', padding: '24px' }">
            <a-spin tip="Loading..." :spinning="loading" :delay="200" style="width: 100%;">
                <virtual-grid v-if="videoList.length" :items="videoList" />
            </a-spin>
        </a-layout-content>
        <a-layout-footer :style="{ backgroundColor: isDark ? '#141414' : '#ffffff' }">
            <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" :total="totalVideos"
                style="width: fit-content; margin: auto;" />
        </a-layout-footer>
    </a-layout>
</template>

<style lang="css" scoped>
.video-list-header {
    padding-inline: 16px;
    background-color: #ffffff;
    border-bottom: 1px solid rgba(5, 5, 5, 0.06);
}

.video-list-header-dark {
    padding-inline: 16px;
    background-color: #141414;
    border-bottom: 1px solid rgba(253, 253, 253, 0.12);
}

:deep(.ant-menu) {
    border-bottom: none;
}
</style>