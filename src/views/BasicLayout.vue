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
.page-header {
    padding-top: 12px;
    padding-inline: 15px;
    align-items: center;
    background-color: white;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
    z-index: 1;
}

.content-layout {
    height: 100%;
}

.page-content {
    background-color: white;
    padding: initial;
}
</style>
