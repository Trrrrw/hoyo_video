<script setup lang="ts">
import emptyLogo from '@/assets/images/empty.avif'

const props = defineProps({
    description: { type: String, default: '暂无数据' }
})
</script>

<template>
    <a-empty :image="emptyLogo" :description="description" />
</template>