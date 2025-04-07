<script setup>
import { useRouter, useRoute } from "vue-router"
import { message } from 'ant-design-vue'

const router = useRouter()
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
    game: {
        type: String,
        required: true
    },
    config: {
        type: Object,
        required: true
    }
})

/** 点击返回按钮 */
const goBack = () => {
    const currentType = () => {
        if (!props.types || !props.videoId) return null
        for (const [type, ids] of Object.entries(props.types)) {
            if (ids.includes(Number(props.videoId))) {
                return type
            }
        }
        return null
    }
    router.push({ path: `/${props.game}`, query: { type: currentType() } })
}

/** 点击下载按钮 */
const downloadButtonClick = () => {
    if (props.data && props.videoId && props.data[props.videoId]) {
        const videoUrl = props.data[props.videoId].src
        const videoTitle = props.data[props.videoId].title
        const extension = videoUrl.split('.').pop()
        const link = document.createElement('a')
        link.href = videoUrl
        link.download = `${videoTitle}.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}

/** 点击分享按钮 */
const shareButtonClick = () => {
    const currentUrl = window.location.href
    const tempTextarea = document.createElement('textarea')
    tempTextarea.value = currentUrl
    document.body.appendChild(tempTextarea)
    tempTextarea.select()
    document.execCommand('copy')
    document.body.removeChild(tempTextarea)
    message.info('已复制链接')
}

/** 打开官网链接 */
const openOfficialWebsite = (url) => {
    window.open(url, '_blank')
}
</script>

<template>
    <a-flex gap="middle" style="padding-top: 5px;">
        <a-button class="gutter-box" @click="goBack">返回</a-button>
        <a-button class="gutter-box" @click="downloadButtonClick">下载</a-button>
        <a-button class="gutter-box" @click="shareButtonClick">分享</a-button>
        <a-button class="gutter-box"
            @click="openOfficialWebsite(`${config['news_detail_url']}${videoId}`)">官网</a-button>
    </a-flex>
</template>

<style scoped></style>