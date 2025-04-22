<script setup>
import { IconFont } from '../utils/iconFont'
import { ref, h } from 'vue'
import { SearchOutlined, GithubOutlined } from '@ant-design/icons-vue'
import { useRoute, useRouter } from "vue-router"
import { handleRSSButtonClick } from '../utils/handleRSSButtonClick'

const route = useRoute()
const router = useRouter()
const handleTitleClick = () => {
    router.push({ path: '/' })
}
const handleGHButtonClick = () => {
    window.open('https://github.com/Trrrrw/hoyo_video')
}
const handleSearchButtonClick = () => {
    router.push({ path: '/search', query: { game: '全部游戏' } })
}
</script>

<template>
    <a-page-header style="padding-top: 0; padding-bottom: 0;">
        <template #title>
            <img src="../assets/logos/logo.png" @click="handleTitleClick"
                style="height: 40px !important;padding: 0 5px 3px 0; cursor: pointer;" />
            <span @click="handleTitleClick" style="height: 80%; cursor: pointer;">
                影像档案架
            </span>
        </template>
        <template #extra>
            <a-button :type="route.name == 'Search' ? 'primary' : 'text'" :ghost="route.name == 'Search'"
                :icon="h(SearchOutlined)" key="2" @click="handleSearchButtonClick" />
            <a-button type="text" :icon="h(IconFont, { type: 'icon-dingyue' })" key="1"
                @click="handleRSSButtonClick(route.params.game || 'index')" />
            <a-button type="text" :icon="h(GithubOutlined)" key="1" @click="handleGHButtonClick" />
        </template>
    </a-page-header>
</template>

<style scoped></style>
