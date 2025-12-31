<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loadGameIcon } from '@/utils/loadGameIcon'
import { timeFromStr, formatTitle } from '@/utils/textFormatter'

interface To {
    name: string
    params?: Record<string, any>
    query?: Record<string, any>
}
const props = defineProps({
    title: { type: String, required: true },
    cover: { type: String, required: true },
    desc: { type: String, default: '' },
    game_name: { type: String, default: '' },
    show_badge: { type: Boolean, default: false },
    to: { type: Object as () => To, required: true },
    from: { type: String, default: '/' }
})

// 点击跳转
const router = useRouter()
const onClick = () => {
    // 保存from链接
    sessionStorage.setItem('returnUrl', props.from)
    const containerScrollTop = document.querySelector('#app > section > section > main > section > main')?.scrollTop
    sessionStorage.setItem('containerScrollTop', containerScrollTop !== undefined ? String(containerScrollTop) : '')
    router.push(props.to)
}

// 图片spin
const loading = ref(true)
</script>

<template>
    <a-card :hoverable="true" @click="onClick" :body-style="{ textAlign: 'center' }">
        <template #cover>
            <a-spin :spinning="loading || cover === './empty.png'" :delay="200">
                <img :src="cover" style="width: 100%; aspect-ratio: 16/8; object-fit: cover;" draggable="false"
                    loading="lazy" @load="() => { loading = false || cover === './empty.png' }" />
                <div v-if="show_badge" class="cover-badge">
                    <img :src="loadGameIcon(game_name)" alt="game icon" style="width: 24px; height: 24px;"
                        draggable="false" loading="lazy" />
                </div>
            </a-spin>
        </template>
        <a-tooltip placement="bottom" :title="props.title" :mouseEnterDelay="0.5">
            <a-card-meta :title="formatTitle(title, game_name)" :description="timeFromStr(desc)" />
        </a-tooltip>
    </a-card>
</template>

<style lang="css" scoped>
.cover-badge {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: fit-content;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>