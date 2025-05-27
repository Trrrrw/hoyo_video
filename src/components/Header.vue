<script setup>
import { computed, h } from 'vue'
import { useRoute } from "vue-router"
import { SearchOutlined, GithubOutlined } from '@ant-design/icons-vue'
import { IconFont } from '../utils/iconFont'
import { copyText } from '../utils/copyText'
import { navigateToHome, navigateToSearch, openGitHubRepo } from '../utils/routerHandlers'

const route = useRoute()
const searchButtonTitle = computed(() => `搜索${route.params.game ? ' - ' + route.params.game : ''}`)
const rssButtonTitle = computed(() => `RSS订阅${route.params.game ? ' - ' + route.params.game : ''}`)
const rssUrl = computed(() => `${window.location.origin}/${route.params.game || 'index'}.xml`)
const GitHubButtonTitle = "GitHub"
</script>

<template>
    <a-page-header style="padding-top: 0; padding-bottom: 0;">
        <template #title>
            <img src="../assets/logos/logo.png" @click="navigateToHome"
                style="height: 40px !important;padding: 0 5px 3px 0; cursor: pointer;" />
            <span @click="navigateToHome" style="height: 80%; cursor: pointer;">
                影像档案架
            </span>
        </template>
        <template #extra>
            <a-tooltip placement="bottom" :title="searchButtonTitle">
                <a-button :type="route.name == 'Search' ? 'primary' : 'text'" :ghost="route.name == 'Search'"
                    :icon="h(SearchOutlined)" key="3" :aria-label="searchButtonTitle"
                    @click="navigateToSearch(route.params.game || '全部游戏')" />
            </a-tooltip>
            <a-tooltip placement="bottom" :title="rssButtonTitle">
                <a-button type="text" :icon="h(IconFont, { type: 'icon-dingyue' })" key="2" :aria-label="rssButtonTitle"
                    @click="copyText(rssUrl, '已复制链接')" />
            </a-tooltip>
            <a-tooltip placement="bottom" :title="GitHubButtonTitle">
                <a-button type="text" :icon="h(GithubOutlined)" key="1" :aria-label="GitHubButtonTitle"
                    @click="openGitHubRepo" />
            </a-tooltip>
        </template>
    </a-page-header>
</template>

<style scoped></style>
