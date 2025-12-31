<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import VideoCard from '@/components/VideoCard.vue'
const route = useRoute()

// 设置页面头信息
import { useHead } from '@vueuse/head'
const pageTitle = computed(() => `${route.params.game} - 影像档案架`)
useHead({
    title: pageTitle,
    meta: [
        {
            name: "description",
            content: `${route.params.game}官网视频整合，包括剧情动画、PV等分类整理`
        }
    ]
})

// 获取视频类型列表
import { fetchTypeList } from '@/utils/useData'
import type { TypeInfo } from '@/utils/useData'
const typeList = ref<TypeInfo[]>([])
const loading = ref<boolean>(false)
const getTypeList = async () => {
    if (route.params.game) {
        loading.value = true
        typeList.value = Array.from({ length: 15 }, () => ({ type_name: 'Loading...', cover: './empty.png' })) as TypeInfo[]
        // await new Promise(resolve => setTimeout(resolve, 1000))
        typeList.value = await fetchTypeList(route.params.game as string)
        loading.value = false
    }
}
watchEffect(getTypeList)

// 计算行数列数
import { useScreenWidth } from '@/utils/useScreenWidth'
const { screenWidth } = useScreenWidth()
const rowCount = ref(0)
const colCount = ref(0)
const setRowColCount = () => {
    if (screenWidth.value >= 1800) {
        colCount.value = 5
    } else if (screenWidth.value >= 1400) {
        colCount.value = 4
    } else if (screenWidth.value >= 1024) {
        colCount.value = 3
    } else if (screenWidth.value >= 600) {
        colCount.value = 2
    } else {
        colCount.value = 1
    }
    rowCount.value = Math.ceil(typeList.value.length / colCount.value)
}
const index = (row: number, col: number) => (row - 1) * colCount.value + (col - 1)
watchEffect(setRowColCount)

// 计算卡片props
const makeCardProps = (row: number, col: number) => {
    const item = typeList.value[index(row, col)]
    const game = Array.isArray(route.params.game)
        ? route.params.game[0] ?? ''
        : (route.params.game as string)
    return {
        title: item?.type_name ?? '',
        cover: item?.cover ?? '',
        to: {
            name: 'VideoList',
            params: { game: game },
            query: {
                type: item?.type_name ?? '',
                page: 1,
                pageSize: 20,
            },
        },
    }
}
</script>

<template>
    <div class="scrollable-container" style="height: 100%;">
        <!-- <a-spin tip="Loading..." :spinning="loading" :delay="200" style="width: 100%; height: 100vh;"> -->
        <a-space :size="16" direction="vertical" style="width: 100%; padding: 24px;">
            <a-row v-for="row_index in rowCount" :gutter="[16, 16]">
                <a-col v-for="col_index in colCount" :key="`${row_index}_${col_index}`"
                    :style="{ width: 100 / colCount + '%' }">
                    <video-card v-if="typeList[index(row_index, col_index)]"
                        v-bind="makeCardProps(row_index, col_index)" />
                </a-col>
            </a-row>
        </a-space>
        <!-- </a-spin> -->
    </div>
</template>