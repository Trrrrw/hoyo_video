<script setup lang="ts">
import AppEmpty from '@/components/AppEmpty.vue'
import { h } from 'vue'
import { GithubFilled, HddOutlined } from '@ant-design/icons-vue'
</script>

<template>
    <a-result title="500" sub-title="服务器寄了捏">
        <template #icon>
            <app-empty description="" :imageStyle="{ height: '200px' }" />
        </template>
        <template #extra>
                <a-button type="primary" :icon="h(GithubFilled)" href="https://github.com/Trrrrw/hoyo_video/issues/new"
                    target="_blank">
                    GitHub Issues
                </a-button>
                <a-button :icon="h(HddOutlined)" href="https://stats.trrw.tech/status/trrrrw" target="_blank">
                    服务状态
                </a-button>
        </template>
    </a-result>
</template>

<style scope></style>