<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { message } from 'ant-design-vue'
import DownloadDialog from "./DownloadDialog.vue"

const currentUrl = window.location.href
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
    const returnUrl = sessionStorage.getItem('returnUrl') || '/'
    router.push(returnUrl)
    sessionStorage.removeItem('returnUrl')
    sessionStorage.removeItem('returnType')
}

/** 点击下载按钮 */
const modalVisible = ref(false)
const downloadButtonClick = async () => {
    modalVisible.value = true
}

/** 点击分享按钮 */
const shareButtonClick = () => {
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
        <a-popover placement="bottom" :overlay-inner-style="{ padding: 0 }">
            <template #content>
                <a-qrcode :value="currentUrl" :bordered="false" />
            </template>
            <a-button class="gutter-box" @click="shareButtonClick">分享</a-button>
        </a-popover>
        <a-button class="gutter-box"
            @click="openOfficialWebsite(`${config['news_detail_url']}${videoId}`)">官网</a-button>
    </a-flex>
    <DownloadDialog v-model:modalVisible="modalVisible" :data="data" :videoId="videoId" />
</template>

<style scoped></style>