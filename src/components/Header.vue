<script setup>
import { h } from 'vue'
import { GithubOutlined } from '@ant-design/icons-vue'
import { useRouter } from "vue-router"

const router = useRouter()
const handleTitleClick = () => {
    router.push({ path: '/' })
}
const handleGHButtonClick = () => {
    window.open('https://github.com/Trrrrw/hoyo_video')
}
</script>

<template>
    <a-page-header style="padding-top: 0; padding-bottom: 0;">
        <template #title>
            <img src="../assets/icons/米游社.png" @click="handleTitleClick"
                style="height: 40px !important;padding-bottom: 3px;" />
            <span @click="handleTitleClick" style="height: 80%; cursor: pointer;">
                米哈游游戏视频
            </span>
        </template>
        <template #extra>
            <a-button type="text" :icon="h(GithubOutlined)" key="1" @click="handleGHButtonClick"></a-button>
        </template>
    </a-page-header>
</template>

<style scoped></style>
