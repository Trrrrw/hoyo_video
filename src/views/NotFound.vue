<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleBackHomeButtonClick = () => {
    router.push('/')
}
</script>

<template>
    <a-result status="404" title="404" sub-title="Page not found">
        <template #extra>
            <a-button type="primary" @click="handleBackHomeButtonClick">Back Home</a-button>
        </template>
    </a-result>
</template>

<style scope></style>