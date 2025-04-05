<script setup>
import { reactive, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from "vue-router"
import { InfoCircleOutlined, createFromIconfontCN } from '@ant-design/icons-vue'
import gamesListData from "../data/data.json"

const route = useRoute()
const router = useRouter()

const gamesList = reactive(gamesListData.games)
const gameIconName = reactive(gamesListData.icons)
const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/c/font_4881579_1z7gxtmeqtb.js',
})
const sideBarItems = reactive([])
const selectedGameOrAbout = computed(() => {
    return route.name === 'About' ? ['about'] :
        route.params.game ? [route.params.game] : []
})

function getItem(label, key, icon, children, type) {
    return {
        label,
        icon,
        children,
        key,
        type,
    };
}
const loadSidebarItems = async () => {
    for (const [index, game] of gamesList.entries()) {
        sideBarItems.push(
            getItem(game, game, () => h(IconFont, { type: gameIconName[index] }), null, null)
        )
    }
}

const handleClick = e => {
    console.log('click', e.key)
    router.push(`/${e.key}`)
}
onMounted(() => {
    loadSidebarItems()
})
</script>

<template>
    <a-flex vertical justify="space-between" style="height: 100%;">
        <a-menu id="gamesMenu" class="sider-menu" v-model:openKeys="selectedGameOrAbout"
            v-model:selectedKeys="selectedGameOrAbout" mode="inline" :items="sideBarItems" @click="handleClick"
            style="padding-top: 5px;"></a-menu>
        <a-menu id="bottomMenu" class="sider-menu" v-model:openKeys="selectedGameOrAbout"
            v-model:selectedKeys="selectedGameOrAbout" mode="inline"
            :items="[getItem('关于', 'about', h(InfoCircleOutlined), null, null)]" @click="handleClick"></a-menu>
    </a-flex>
</template>

<style scoped>
.sider-menu {
    border-inline-end: none !important;
}

.icons-list :deep(.anticon) {
    margin-right: 6px;
    font-size: 24px;
}
</style>
