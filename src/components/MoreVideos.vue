<script setup lang="ts">
import VideoCardSmall from './VideoCardSmall.vue'
import AppEmpty from './AppEmpty.vue'

const props = defineProps({
    game: { type: String, required: true },
    id: { type: Number, required: true },
    types: { type: Object as () => string[], required: true }
})

// 获取侧边栏视频列表
import { nextTick, watchEffect, ref } from 'vue'
import { fetchVideoPlayCountList } from '@/utils/useData'
import { fetchVideoList } from '@/utils/useData'
import type { VideoInfo } from '@/utils/useData'
const loading = ref(false)
const siderVideoList = ref<VideoInfo[]>([])
const getSiderVideoList = async () => {
    if (props.game && props.types) {
        loading.value = true
        try {
            const promises = props.types.map(type =>
                fetchVideoList(props.game, type, 1, 20, true)
            )

            const results = await Promise.all(promises)
            const allVideos = results.flatMap(result => result.video_list)

            siderVideoList.value = allVideos
                .filter(v => v.id !== props.id)
                .filter((v, i, arr) =>
                    arr.findIndex(item => item.id === v.id) === i
                )
                .sort((a, b) =>
                    new Date(b.time).getTime() - new Date(a.time).getTime()
                )
            await fetchVideoPlayCountList(siderVideoList.value)
        } finally {
            loading.value = false
            await nextTick()
        }
    }
}
watchEffect(getSiderVideoList)

// 深色模式
import { useDarkTheme } from '@/utils/useDarkTheme'
const { isDark } = useDarkTheme()
</script>

<template>
    <a-layout-sider class="more-videos" width="20vw" :style="{ backgroundColor: isDark ? '#141414' : '#ffffff' }">
        <a-spin tip="Loading..." :spinning="loading" :delay="200" style="width: 100%;">
            <a-flex v-if="siderVideoList.length > 0" vertical gap="middle">
                <video-card-small v-for="video in siderVideoList" :video-info="video" />
            </a-flex>
            <app-empty v-else-if="!loading" />
        </a-spin>
    </a-layout-sider>
</template>

<style lang="css" scoped>
.more-videos {
    height: fit-content;
    background-color: white;
    margin: 24px 24px 24px 0;
    padding-bottom: 24px;
}
</style>