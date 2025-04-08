<script setup>
import { CloudDownloadOutlined, VideoCameraOutlined, PictureOutlined } from '@ant-design/icons-vue'
const props = defineProps({
    modalVisible: {
        type: Boolean,
        required: true
    },
    data: {
        type: Object,
        required: true,
    },
    videoId: {
        type: [String, Number],
        required: true,
    },
})

const emit = defineEmits(['update:modalVisible'])
const handleVisibleChange = (newValue) => {
    emit('update:modalVisible', newValue)
}

const download = (url) => {
    const fileName = props.data[props.videoId].title
    const extension = url.split('.').pop()
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}
const downloadVideo = () => {
    if (props.data && props.videoId && props.data[props.videoId]) {
        const videoUrl = props.data[props.videoId].src
        download(videoUrl)
    }
}
const downloadCover = () => {
    if (props.data && props.videoId && props.data[props.videoId]) {
        const coverUrl = props.data[props.videoId].post
        console.log(coverUrl)
        download(coverUrl)
    }
}
</script>
<template>
    <a-modal v-model:open="props.modalVisible" centered :footer="null" @cancel="handleVisibleChange(false)">
        <template #title>
            <CloudDownloadOutlined /> 下载
        </template>
        <a-flex class="download-button-container" wrap="wrap" justify="center" align="center" gap="small">
            <a-button class="download-button" @click="downloadVideo">
                <VideoCameraOutlined /> 视频
            </a-button>
            <a-button class="download-button" @click="downloadCover">
                <PictureOutlined /> 封面
            </a-button>
        </a-flex>
    </a-modal>
</template>
<style scoped>
.download-button-container {
    height: 200px;
}

.download-button {
    width: 48%;
    height: 80%;
    font-size: 20px;
}
</style>