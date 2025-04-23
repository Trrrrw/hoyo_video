<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import Card from "../components/Card.vue"
import { navigateToVideo } from "../utils/routerHandlers"

const route = useRoute()
const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
    videoId: {
        type: [String, Number],
        required: true,
    },
    types: {
        type: Object,
        required: true,
    },
    isMobileDevice: {
        type: Boolean,
        required: true,
    },
    returnType: {
        type: String,
        required: true,
    },
})

/** 格式化卡片标题 */
const formatTitle = computed(() => {
    if (!props.data || !props.types) return ''
    return (itemId) => {
        const title = props.data[itemId]?.title || ''
        if (title == '《绝区零》×《街霸6》制作人对谈') return title
        const result = title
            .replace(`《${route.params.game}》——`, '')
            .replace(`《${route.params.game}》`, '')
            .trim()
        return result === '' ? title : result
    }
})
</script>

<template>
    <a-flex vertical class="more-video-content">
        <a-divider>更多视频</a-divider>
        <div class="scrollable-container">
            <a-card>
                <a-flex gap="middle" justify="center" :vertical="!props.isMobileDevice"
                    :wrap="props.isMobileDevice ? 'wrap' : ''">
                    <Card
                        v-for="itemId in props.types[returnType]?.filter(id => Number(id) !== Number(props.videoId)) || []"
                        :key="itemId" v-if="props.data && props.data[props.videoId]" :cover="props.data[itemId]?.post"
                        :title="formatTitle(itemId)" @click="navigateToVideo(route.params.game, itemId)" />
                </a-flex>
            </a-card>
        </div>
    </a-flex>
</template>

<style scoped>
.more-video-content {
    /* width: 100%; */
    height: 100%;
    padding: 0 10px;
    margin: 0 -10px;
}

/* 滚动容器 */
.scrollable-container {
    flex: 1;
    /* 占据剩余空间 */
    overflow-y: auto;
    /* 允许垂直滚动 */
    overflow-x: hidden;
    /* 禁止水平滚动 */
    margin-top: 10px;
    /* 与标题保持间距 */
}

/* 隐藏滚动条 */
.scrollable-container::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari and Opera */
}

.scrollable-container {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}
</style>
