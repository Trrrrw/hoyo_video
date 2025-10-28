<script setup lang="ts">
import { h } from 'vue'
import { CalendarOutlined, YoutubeOutlined } from '@ant-design/icons-vue'
import { formatTitle } from '@/utils/textFormatter'

import type { VideoInfo } from '@/utils/useData'
const props = defineProps({
    videoInfo: { type: Object as () => VideoInfo, required: true }
})

// 屏幕宽度->封面宽高
import { useScreenWidth } from '@/utils/useScreenWidth'
const { screenWidth } = useScreenWidth()
import { ref, watchEffect } from 'vue'
const coverHeight = ref(0)
const setCoverHeight = () => {
    if (screenWidth.value >= 1800)
        coverHeight.value = 107
    else
        coverHeight.value = 80
}
watchEffect(setCoverHeight)

// 点击跳转
import { useRouter } from 'vue-router'
const router = useRouter()
const onClick = () => {
    router.push({
        name: 'VideoPlayer',
        params: { game: props.videoInfo.game },
        query: {
            id: props.videoInfo.id
        }
    })
    const scrollableContainer = document.querySelector('#app > section > section > main')
    scrollableContainer?.scrollTo({
        top: 0,
        behavior: 'auto'
    })
}
</script>

<template>
    <a-flex gap="small" style="width: 100%;">
        <div class="pic-box" :style="{ height: `${coverHeight}px` }" @click="onClick">
            <img class="card-cover" :src="videoInfo.cover" loading="lazy" />
        </div>
        <a-flex vertical class="info-box" gap="small">
            <p class="card-title" @click="onClick">
                {{ formatTitle(videoInfo.title, videoInfo.game) }}
            </p>
            <a-flex>
                <a-tag :bordered="false" :icon="h(CalendarOutlined)">
                    {{ videoInfo.time.split(' ')[0] }}
                </a-tag>
                <a-tag :bordered="false" :icon="h(YoutubeOutlined)">
                    {{ videoInfo.play_count ?? 0 }}
                </a-tag>
            </a-flex>
        </a-flex>
    </a-flex>
</template>

<style lang="css" scoped>
.pic-box {
    aspect-ratio: 16/9;
    flex: 0 0 auto;
}

.card-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-cover:hover {
    filter: brightness(0.9);
}

.info-box {
    flex: 1;
}

.card-title {
    width: 100%;
    cursor: pointer;
    font-size: 16px;
    margin: 0;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-title:hover {
    color: #1677ff;
}

:deep(.ant-tag) {
    width: min-content;
}
</style>