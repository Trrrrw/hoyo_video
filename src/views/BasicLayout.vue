<script setup>
import Header from '../components/Header.vue'
import Sider from '../components/Sider.vue'
</script>

<template>
    <a-layout class="page-layout">
        <a-layout-header class="page-header">
            <Header />
        </a-layout-header>
        <a-layout class="content-layout">
            <Sider />
            <a-layout class="page-layout">
                <a-layout-content class="page-content scrollable-container">
                    <router-view />
                </a-layout-content>
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
</style>
