<script setup>
import { reactive, ref, onMounted, h } from 'vue'
import { InfoCircleOutlined, createFromIconfontCN } from '@ant-design/icons-vue'
import gamesListData from "../data/data.json"

const gamesList = reactive(gamesListData.games)
const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/c/font_4881579_1z7gxtmeqtb.js',
})
const sideBarItems = reactive([])
const selectedKeys = ref([gamesList[0]])
const openKeys = ref([gamesList[0]])
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
    for (const game of gamesList) {
        sideBarItems.push(
            getItem(game, game, () => h(IconFont, { type: 'icon-yuanshen-heng' }), null, null)
        )
    }
}
const handleClick = e => {
    console.log('click', e)
}
onMounted(() => {
    loadSidebarItems()
})
</script>

<template>
    <a-flex vertical align="space-between">
        <a-menu id="gamesMenu" v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys" mode="inline"
            :items="sideBarItems" @click="handleClick"></a-menu>
        <a-menu id="bottomMenu" v-model:openKeys="openKeys" v-model:selectedKeys="selectedKeys" mode="inline"
            :items="[getItem('关于', 'about', h(InfoCircleOutlined), null, null)]" @click="handleClick"
            style="position: absolute;bottom: 0;"></a-menu>
    </a-flex>
</template>

<style scoped>
.icons-list :deep(.anticon) {
    margin-right: 6px;
    font-size: 24px;
}
</style>
