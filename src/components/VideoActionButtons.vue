<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import DownloadDialog from "./DownloadDialog.vue"
import { navigateTo } from "../utils/routerHandlers"
import { copyText } from "../utils/copyText"

const currentUrl = window.location.href
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

const isDarkMode = ref(false)

const updateDarkMode = () => {
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
    updateDarkMode()
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateDarkMode)
})

onUnmounted(() => {
    // 清理监听器
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateDarkMode)
})

/** 点击返回按钮 */
const goBack = () => {
    const returnUrl = sessionStorage.getItem('returnUrl') || '/'
    navigateTo(returnUrl)
    sessionStorage.removeItem('returnUrl')
    sessionStorage.removeItem('returnType')
}

/** 点击下载按钮 */
const modalVisible = ref(false)
const downloadButtonClick = async () => {
    document.querySelector('video')?.pause()
    modalVisible.value = true
}

/** 打开官网链接 */
const openOfficialWebsite = (url) => {
    document.querySelector('video')?.pause()
    window.open(url, '_blank')
}
</script>

<template>
    <a-flex gap="middle" style="padding-top: 5px;">
        <a-button class="gutter-box" @click="goBack">返回</a-button>
        <a-button class="gutter-box" @click="downloadButtonClick">下载</a-button>
        <a-popover placement="bottom" :overlay-inner-style="{ padding: 0 }">
            <template #content>
                <a-qrcode :value="currentUrl" :color="isDarkMode ? '#fff' : '#000'" :bordered="false" />
            </template>
            <a-button class="gutter-box" @click="copyText(currentUrl, '已复制链接')">分享</a-button>
        </a-popover>
        <a-button class="gutter-box"
            @click="openOfficialWebsite(`${config['news_detail_url']}${videoId}/${game == '崩坏3' ? 'detail' : ''}`)">官网</a-button>
    </a-flex>
    <DownloadDialog v-model:modalVisible="modalVisible" :data="data" :videoId="videoId" />
</template>

<style scoped></style>