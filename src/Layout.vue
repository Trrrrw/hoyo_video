<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppSider from '@/components/AppSider.vue'

import { theme } from 'ant-design-vue'
import { useDarkTheme } from '@/utils/useDarkTheme'
const { isDark } = useDarkTheme()

// 返回顶部按钮
import { BackTop } from 'ant-design-vue'
import { ref, onMounted, nextTick, watch  } from 'vue'
const scrollElement = ref<HTMLElement | null>(null)
const updateScrollTarget = async () => {
  await nextTick()
  const el = document.querySelector('.scrollable-container')
  scrollElement.value = el instanceof HTMLElement ? el : null
}

import { useRoute } from 'vue-router'
const route = useRoute()
watch(
  () => route.fullPath,
  () => updateScrollTarget(),
  { immediate: true }
)
</script>

<template>
    <a-config-provider :theme="{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }">
        <a-layout style="overflow: hidden;">
            <app-header />
            <a-layout>
                <app-sider />
                <a-layout-content :style="{ backgroundColor: isDark ? '#141414' : '#ffffff' }">
                    <router-view />
                    <back-top :target="() => scrollElement!" />
                </a-layout-content>
            </a-layout>
        </a-layout>
    </a-config-provider>
</template>