<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppSider from '@/components/AppSider.vue'

import { theme } from 'ant-design-vue'
import { useDarkTheme } from '@/utils/useDarkTheme'
const { isDark } = useDarkTheme()
</script>

<template>
    <a-config-provider :theme="{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }">
        <a-layout style="overflow: hidden;">
            <app-header />
            <a-layout>
                <app-sider />
                <a-layout-content class="scrollable-container"
                    :style="{ backgroundColor: isDark ? '#141414' : '#ffffff' }">
                    <router-view />
                </a-layout-content>
            </a-layout>
        </a-layout>
    </a-config-provider>
</template>