<script setup>
import Header from '../components/Header.vue'
import Sider from '../components/Sider.vue'
import Footer from '../components/Footer.vue'
import { ref, onMounted, onUnmounted } from 'vue'
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
            <a-layout-content class="page-content scrollable-container">
            </a-layout-content>
        </a-layout>
        <a-layout-footer class="page-footer">
            <Footer />
        </a-layout-footer>
    </a-layout>
</template>

<style scoped>
.page-layout {
    height: 100%;
    background: transparent;
}

.page-header {
    padding-inline: 0;
    line-height: 64px;
    background-color: transparent;
}

.content-sider {
    background-color: white;
}

.page-content {
    /* height: 100%; */
    min-height: 120;
    line-height: 120px;
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
    background-color: transparent;
}
</style>
