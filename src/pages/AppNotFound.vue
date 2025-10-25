<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
    <a-result status="404" title="404" sub-title="Page not found">
        <template #extra>
            <a-button type="primary" @click="router.push('/')">Back Home</a-button>
        </template>
    </a-result>
</template>

<style scope></style>