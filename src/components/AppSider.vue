<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { h, ref, reactive, watchEffect, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { MenuInfo } from 'ant-design-vue/es/menu/src/interface'
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { loadGameIcon } from '@/utils/loadGameIcon'


// 侧边栏状态
import { useScreenWidth } from '@/utils/useScreenWidth'
const { screenWidth } = useScreenWidth()
const siderState = reactive<{
    collapsed: boolean
    collapsedWidth: number
    collapsible: boolean
}>({
    collapsed: false,
    collapsedWidth: 80,
    collapsible: false
})
const setSiderState = () => {
    siderState.collapsed = screenWidth.value >= 1200 ? false : true
    siderState.collapsedWidth = screenWidth.value >= 768 ? 80 : 0
    siderState.collapsible = screenWidth.value >= 1200 ? false : true
}
watchEffect(setSiderState)

// 侧边栏选中项
const route = useRoute()
const selectedItem: Ref<string[]> = ref([])
const setSelectedItem = () => {
    selectedItem.value = route.name === 'AppAbout' ? ['about'] : route.name === 'AppSearch' ? [''] : route.params.game ? [route.params.game as string] : ['']
}
watchEffect(setSelectedItem)

// 侧边栏选项
import { fetchGameList } from "@/utils/useData"
import type { MenuItem } from '@/utils/menuItem'
const sideBarTopItems = ref<MenuItem[]>([])
onMounted(async () => {
    try {
        // 动态生成 items
        const games = await fetchGameList()
        const dynamicItems: MenuItem[] = games
            .sort((a, b) => a.weight - b.weight)
            .map(item => ({
                label: item.name,
                icon: h('img', { src: loadGameIcon(item.name), style: { width: '14px' }, draggable: false }),
                children: null,
                key: item.name,
                type: null
            }))
        // 添加固定的搜索项在最前
        sideBarTopItems.value = [
            {
                label: '搜索',
                icon: h(SearchOutlined),
                children: null,
                key: '',
                type: null
            },
            ...dynamicItems
        ]
    } catch (err) {
        console.error('获取侧边栏数据失败', err)
    }
})
const sideBarBottomItems = [{ label: '关于', icon: h(InfoCircleOutlined), children: null, key: 'about', type: null }]

// 侧边栏点击事件
const router = useRouter()
const handleSideItemClick = (info: MenuInfo) => {
    if (!info.key) {
        router.push('/')
    } else {
        router.push(`/${info.key}`)
    }
    if (siderState.collapsible) {
        siderState.collapsed = true
    }
}
</script>

<template>
    <a-layout-sider id="app-sider" v-model:collapsed="siderState.collapsed" :collapsedWidth="siderState.collapsedWidth"
        :collapsible="siderState.collapsible" theme="light">
        <a-flex vertical justify="space-between" style="height: 100%;">
            <a-menu class="sider-top-items" v-model:openKeys="selectedItem" v-model:selectedKeys="selectedItem"
                mode="inline" :items="sideBarTopItems" @click="handleSideItemClick" style="padding-top: 5px;" />
            <a-menu class="sider-bottom-items" v-model:openKeys="selectedItem" v-model:selectedKeys="selectedItem"
                mode="inline" :items="sideBarBottomItems" @click="handleSideItemClick" />
        </a-flex>
    </a-layout-sider>
</template>

<style lang="css" scoped>
/* 侧边栏右侧边框 */
#app-sider {
    border-inline-end: 1px solid rgba(5, 5, 5, 0.06);
}

:deep(.ant-menu) {
    text-align: center;
    border-inline-end: none !important;
}
</style>