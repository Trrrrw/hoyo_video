<script setup lang="ts">
import AppEmpty from '@/components/AppEmpty.vue';
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
    <a-result title="500" sub-title="服务器寄了捏">
        <template #icon>
            <app-empty description="" :imageStyle="{ height: '200px' }" />
        </template>
        <template #extra>
            <a-button type="primary" href="https://github.com/Trrrrw/hoyo_video/issues/new" target="_blank">GitHub
                Issues</a-button>
        </template>
    </a-result>
</template>

<style scope></style>