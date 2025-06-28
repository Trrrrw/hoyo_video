<script setup>
import { ref } from 'vue'
import { CloudDownloadOutlined, VideoCameraOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { copyText } from '../utils/copyText'

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

const coverDownloading = ref(false)

// const downloadWithFetch = (url, name) => {
//     fetch(url)
//         .then(res => res.blob())
//         .then(blob => {
//             const a = document.createElement("a");
//             const objectUrl = window.URL.createObjectURL(blob);
//             a.download = name;
//             a.href = objectUrl;
//             a.click();
//             window.URL.revokeObjectURL(objectUrl);
//             a.remove();
//         })
//         .catch(err => {
//             message.error('下载失败，请稍后重试')
//         })
// }

const download = (url) => {
    const fileName = props.data[props.videoId].title
    const extension = url.split('.').pop()
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = `${fileName}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const downloadVideo = () => {
    if (props.data && props.videoId && props.data[props.videoId]) {
        const videoTitle = props.data[props.videoId].title
        copyText(videoTitle, '已复制视频标题')
        const videoUrl = props.data[props.videoId].src
        download(videoUrl)
    }
}

const downloadCover = () => {
    if (props.data && props.videoId && props.data[props.videoId]) {
        const videoTitle = props.data[props.videoId].title
        copyText(videoTitle, '已复制视频标题')
        const coverUrl = props.data[props.videoId].post
        const fileName = props.data[props.videoId].title
        coverDownloading.value = true
        // downloadWithFetch(coverUrl, fileName)
        download(coverUrl)
        coverDownloading.value = false
    }
}
</script>

<template>
    <a-modal :open="modalVisible" centered :footer="null" @update:open="handleVisibleChange"
        @cancel="handleVisibleChange(false)">
        <template #title>
            <CloudDownloadOutlined /> 下载
        </template>
        <a-flex class="download-button-container" wrap="wrap" justify="center" align="center" gap="small">
            <a-button class="download-button" @click="downloadVideo"
                @contextmenu.prevent="copyText(props.data[props.videoId].src, '已复制视频链接')">
                <VideoCameraOutlined /> 视频
            </a-button>
            <a-button class="download-button" @click="downloadCover" :loading="coverDownloading"
                @contextmenu.prevent="copyText(props.data[props.videoId].post, '已复制封面链接')">
                <PictureOutlined /> 封面
            </a-button>
        </a-flex>
        <p style="color: #999999; font-size: 12px; font-weight: 300;margin: 0 auto; text-align-last: right;">右键复制链接</p>
    </a-modal>
</template>
<style scoped>
.download-button-container {
    height: 150px;
}

.download-button {
    width: 48%;
    height: 80%;
    font-size: 20px;
}
</style>