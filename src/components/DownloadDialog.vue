<script setup lang="ts">
import { computed, h } from 'vue'
import { QuestionCircleOutlined, CopyOutlined } from '@ant-design/icons-vue'

import type { VideoInfo } from '@/utils/useData'
const props = defineProps({
    modalVisible: { type: Boolean, required: true },
    videoInfo: { type: Object as () => VideoInfo, required: true }
})
const emit = defineEmits(['update:modalVisible'])
const handleVisibleChange = (newValue: boolean) => {
    emit('update:modalVisible', newValue)
}

// 选择下载项
import { ref } from 'vue'
const downloadSelected = ref<string>('视频')
const radioItems = ref<string[]>(['视频', '封面'])

// 下载
import pkg from 'file-saver'
const { saveAs } = pkg
const download = () => {
    var url = ''
    var fileName = ''
    var extension = ''
    switch (downloadSelected.value) {
        case '视频':
            url = props.videoInfo.src
            fileName = props.videoInfo.title
            extension = url.split('.').pop() ?? ''
            const a = document.createElement('a')
            a.href = url
            a.target = '_blank'
            a.download = `${fileName}.${extension}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            copyText(fileName, '已复制标题')
            break;
        case '封面':
            url = props.videoInfo.cover
            fileName = props.videoInfo.title
            extension = url.split('.').pop() ?? ''
            saveAs(url, `${fileName}.${extension}`)
            break;
        default:
            break;
    }
}
const isSafari = computed(() => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
})

// 复制链接
import { copyText } from '@/utils/copyText'
const copyLink = (item: string) => {
    switch (item) {
        case '视频':
            copyText(props.videoInfo.src, '已复制链接')
            break;
        case '封面':
            copyText(props.videoInfo.cover, '已复制链接')
            break;
        default:
            break;
    }
}
</script>

<template>
    <a-modal :open="modalVisible" centered ok-text="确认" cancel-text="取消" @update:open="handleVisibleChange"
        @cancel="handleVisibleChange(false)" @ok="download">
        <template #title>
            下载
            <a-tooltip :mouseEnterDelay="0.5">
                <template #title>
                    如果点击下载视频后弹出新标签页播放视频，可以在新标签页视频进度条右侧菜单中找到下载按钮
                    <a-typography-link target="_blank"
                        href="https://www.xiaohongshu.com/discovery/item/6821d921000000000f031582?source=webshare&xhsshare=pc_web&xsec_token=ABbIlA1lF2dxxO7fCR2zaPjd3iTwZf8xgs4wprc_mzbc0=&xsec_source=pc_share">
                        更多
                    </a-typography-link>
                </template>
                <question-circle-outlined />
            </a-tooltip>
        </template>
        <a-radio-group v-model:value="downloadSelected" style="width: 100%; padding-top: 5px;">
            <a-radio v-for="item in radioItems" class="download-radio" :value="item">
                <a-flex align="center" justify="space-between" style="width: 100%;">
                    <span>{{ item }}</span>
                    <a-button class="copy-icon" :icon="h(CopyOutlined)" :key="item" @click="copyLink(item)" />
                </a-flex>
            </a-radio>
        </a-radio-group>
        <a-typography-link v-if="isSafari" :href="videoInfo.src">由于iOS系统限制，iOS用户可以尝试长按此处下载</a-typography-link>
    </a-modal>
</template>

<style lang="css" scoped>
.download-radio {
    width: 100%;
    padding: 16px;
    margin-bottom: 8px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
}

.download-radio:hover {
    border-color: #9ac4fe;
    background-color: #eff6ff;
}

.download-radio.ant-radio-wrapper-checked {
    border-color: #1677ff;
    background-color: #eff6ff;
}

.download-radio .ant-radio {
    margin-right: 12px;
}

:deep(.download-radio>span:nth-child(2)) {
    width: 100%;
}

.copy-icon {
    margin-left: auto;
    padding: 4px 8px;
}
</style>
