<script setup lang="ts">
import type { CSSProperties } from 'vue'
import emptyLogo from '@/assets/images/empty.avif'

const props = defineProps({
    description: { type: String, default: '暂无数据' },
    imageStyle: {
        type: Object as () => CSSProperties,
        default: () => ({})
    }
})
</script>

<template>
    <a-empty :image="emptyLogo" :description="description" :imageStyle="imageStyle" />
</template>