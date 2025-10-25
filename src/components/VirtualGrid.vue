<script setup lang="ts">
import { ref, onMounted, nextTick, watchEffect } from "vue"
import VideoCard from "./VideoCard.vue"

import type { VideoInfo } from "@/utils/useData"
const props = defineProps({
    items: { type: Object as () => VideoInfo[], required: true },
    show_badge: { type: Boolean, default: false },
})

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
    rowCount.value = Math.ceil(props.items.length / colCount.value)
}
const index = (row: number, col: number) => (row - 1) * colCount.value + (col - 1)
watchEffect(setRowColCount)

// 判断卡片所在列是否可见
const visibleRows = ref<Set<number>>(
    new Set(Array.from({ length: 10 }, (_, i) => i))
)
const onScroll = async () => {
    const buffer = 3
    const gridRows = document.querySelectorAll<HTMLElement>('.grid-row')
    const scrollableContainer = document.querySelector<HTMLElement>('#app > section > section > main > section > main')
    if (!scrollableContainer) return

    const containerRect = scrollableContainer.getBoundingClientRect()

    let firstVisibleIndex: number | null = null
    let lastVisibleIndex: number | null = null

    gridRows.forEach((row, index) => {
        const rowRect = row.getBoundingClientRect()
        // 判断是否和滚动容器可视区域相交
        const isVisible = rowRect.bottom >= containerRect.top && rowRect.top <= containerRect.bottom
        if (isVisible) {
            if (firstVisibleIndex === null) firstVisibleIndex = index
            lastVisibleIndex = index
        }
    })

    if (firstVisibleIndex !== null && lastVisibleIndex !== null) {
        const start = Math.max(firstVisibleIndex - buffer, 0)
        const end = Math.min(lastVisibleIndex + buffer, gridRows.length - 1)

        const newVisibleRows = new Set<number>()
        for (let i = start; i <= end; i++) {
            newVisibleRows.add(i)
        }
        visibleRows.value = newVisibleRows
    } else {
        visibleRows.value.clear()
    }
}
onMounted(() => {
    const scrollableContainer = document.querySelector('#app > section > section > main > section > main')
    scrollableContainer?.addEventListener('scroll', onScroll)
})

// 计算卡片props
import { useRouter } from "vue-router"
const router = useRouter()
const makeCardProps = (row: number, col: number) => {
    const item = props.items[index(row, col)]
    const game = item?.game
    return {
        title: item?.title ?? '',
        cover: item?.cover ?? '',
        desc: item?.time ?? '',
        game_name: game,
        show_badge: props.show_badge,
        to: {
            name: 'VideoPlayer',
            params: { game: game },
            query: {
                id: item?.id ?? ''
            },
        },
        from: router.currentRoute.value.fullPath
    }
}

// 计算单行高度
const rowHeight = ref(0)
onMounted(async () => {
    await nextTick()
    const firstGridRow = document.querySelectorAll<HTMLElement>('.grid-row')[0]
    rowHeight.value = firstGridRow?.getBoundingClientRect().height ?? 0
})
</script>

<template>
    <a-space :size="16" direction="vertical" :style="{ width: '100%' }">
        <a-row class="grid-row" v-for="row_index in rowCount" :gutter="[16, 16]">
            <a-col v-for="col_index in colCount" :key="`${row_index}_${col_index}`"
                v-if="visibleRows.has(row_index - 1)" :style="{ width: 100 / colCount + '%' }">
                <video-card v-if="items && items[index(row_index, col_index)]"
                    v-bind="makeCardProps(row_index, col_index)"
                    :key="`${items[index(row_index, col_index)]?.game}_${items[index(row_index, col_index)]?.id}`" />
            </a-col>
            <div v-else :style="{ width: '100%', height: `${rowHeight}px` }"></div>
        </a-row>
    </a-space>
</template>

<style scoped></style>
