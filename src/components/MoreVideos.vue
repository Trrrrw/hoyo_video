<script setup lang="ts">
import VideoCardSmall from './VideoCardSmall.vue'

const props = defineProps({
    game: { type: String, required: true },
    id: { type: Number, required: true },
    types: { type: Object as () => string[], required: true }
})

// 获取侧边栏视频列表
import { nextTick, watchEffect, ref } from 'vue'
import { fetchVideoList } from '@/utils/useData'
import type { VideoInfo } from '@/utils/useData'
const siderLoading = ref(false)
const siderVideoList = ref<VideoInfo[]>([])
const getSiderVideoList = async () => {
    if (props.game && props.types) {
        siderLoading.value = true
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
            await nextTick()
        } finally {
            siderLoading.value = false
        }
    }
}
watchEffect(getSiderVideoList)
</script>

<template>
    <a-layout-sider class="more-videos" width="20vw">
        <a-flex vertical gap="middle">
            <video-card-small v-for="video in siderVideoList" :video-info="video" />
        </a-flex>
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