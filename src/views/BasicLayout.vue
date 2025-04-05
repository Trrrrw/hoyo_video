<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Header from '../components/Header.vue'
import Sider from '../components/Sider.vue'
import Footer from '../components/Footer.vue'
/** 检测屏幕大小并调整侧边栏 */
const collapsed = ref(false)
const collapsedWidth = ref(80)
const collapsible = ref(false)
const checkScreenSize = () => {
    const width = window.innerWidth
    if (width >= 1200) {
        collapsed.value = false
        collapsible.value = false
    } else if (width >= 768) {
        collapsed.value = true
        collapsible.value = true
        collapsedWidth.value = 80
    } else {
        collapsed.value = true
        collapsible.value = true
        collapsedWidth.value = 0
    }
}
onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
})
onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
})
</script>

<template>
    <a-layout class="page-layout">
        <a-layout-header class="page-header">
            <Header />
        </a-layout-header>
        <a-layout class="content-layout">
            <a-layout-sider v-model:collapsed="collapsed" :collapsedWidth="collapsedWidth" :collapsible="collapsible"
                theme="light" class="content-sider">
                <Sider />
            </a-layout-sider>
            <a-layout class="page-layout">
                <a-layout-content class="page-content scrollable-container">
                    <router-view />
                </a-layout-content>
                <a-layout-footer class="page-footer">
                    <Footer />
                </a-layout-footer>
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<style scoped>
.page-layout {
    height: 100%;
    background: transparent;
}

.page-header {
    padding-top: 12px;
    padding-inline: 15px;
    align-items: center;
    background-color: transparent;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
    z-index: 1;
}

.content-layout {
    height: 100%;
}

.content-sider {
    background-color: white;
    border-inline-end: 1px solid rgba(5, 5, 5, 0.06);
}

.page-content {
    height: 100%;
    min-height: 120;
    line-height: 120px;
    background-color: white;
}

.scrollable-container {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.scrollable-container::-webkit-scrollbar {
    display: none;
}

.scrollable-container {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

.page-footer {
    text-align: center;
    background-color: white;
}
</style>
