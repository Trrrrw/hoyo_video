<script setup>
import { computed } from 'vue'
import { getColorFromString } from '../utils/getColorFromString'
const props = defineProps({
    cover: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    badge: {
        type: String,
        required: false,
    },
    badgeColor: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    tooltip: {
        type: String,
        required: false,
    }
})
const badgeColor = computed(() => props.badgeColor ? props.badgeColor : getColorFromString(props.badge))
</script>

<template>
    <a-card hoverable class="card-container">
        <template #cover>
            <template v-if="badge">
                <a-badge-ribbon v-if="badge" :color="badgeColor" placement="start" :text="badge">
                    <a-image class="card-cover" height="180px" :preview="false" :src="cover">
                        <template #placeholder>
                            <a-spin :delay="500" />
                        </template>
                    </a-image>
                </a-badge-ribbon>
            </template>
            <template v-else>
                <a-image class="card-cover" height="180px" :preview="false" :src="cover">
                    <template #placeholder>
                        <a-spin :delay="500" />
                    </template>
                </a-image>
            </template>
        </template>
        <a-tooltip placement="bottom" :title="props.tooltip || props.title" :mouseEnterDelay="0.5">
            <a-card-meta :title="props.title" :description="props.description" />
        </a-tooltip>
    </a-card>
</template>

<style scoped>
.card-container {
    width: calc((100% - 64px) / 5);
    min-width: 280px;
}

/* 响应式调整 */
@media (max-width: 1800px) {
    .card-container {
        width: calc((100% - 48px) / 4);
        /* 4列布局 */
    }
}

@media (max-width: 1400px) {
    .card-container {
        width: calc((100% - 32px) / 3);
        /* 3列布局 */
    }
}

@media (max-width: 1024px) {
    .card-container {
        width: calc((100% - 16px) / 2);
        /* 2列布局 */
    }
}

@media (max-width: 768px) {
    .card-container {
        width: 100%;
        /* 单列布局 */
        max-width: 100%;
    }
}

:deep(.card-cover) {
    object-fit: cover;
}

:deep(.ant-image) {
    display: block;
}
</style>