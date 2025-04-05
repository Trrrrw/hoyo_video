<script setup>
import { h } from 'vue'
import { GithubOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const handleTitleClick = () => {
    router.push({ path: '/' })
}
</script>

<template>
    <a-page-header>
        <template #title>
            <span @click="handleTitleClick" style="cursor: pointer;">
                米哈游游戏视频
            </span>
        </template>
        <template #extra>
            <a-button type="text" :icon="h(GithubOutlined)" key="1"></a-button>
        </template>
    </a-page-header>
</template>

<style scoped></style>
