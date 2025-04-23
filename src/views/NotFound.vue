<script setup>
import { navigateToHome } from '../utils/routerHandlers'
</script>

<template>
    <a-result status="404" title="404" sub-title="Page not found">
        <template #extra>
            <a-button type="primary" @click="navigateToHome">Back Home</a-button>
        </template>
    </a-result>
</template>

<style scope></style>