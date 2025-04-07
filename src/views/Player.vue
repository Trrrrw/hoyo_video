<script setup>
import { ref, computed, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import MoreVideo from "../components/MoreVideo.vue";
import VideoActionButtons from "../components/VideoActionButtons.vue";

const route = useRoute()
const game = computed(() => route.params.game)
const videoId = computed(() => route.query.id)
const data = ref(null)
const types = ref(null)
const config = ref(null)
const iconPath = computed(() => {
  return new URL(`../assets/icons/${game.value}.png`, import.meta.url).href
})

/** 设置页面标题和图标 */
const setPageIcon = () => {
  // 设置页面标题
  if (data.value && videoId.value && data.value[videoId.value]) {
    const title = data.value[videoId.value].title
      .replace(`《${game.value}》——`, '') // 游戏名
      .replace(`《${game.value}》`, '') // 游戏名
      .trim()
    document.title = `${title} | ${game.value}`
  }
  // 设置页面图标
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.rel = 'icon'
  link.href = iconPath.value
  document.head.appendChild(link)
}
/** 动态导入 JSON 文件 */
const loadData = async () => {
  if (game.value && videoId.value) {
    try {
      const data_re = await import(`../data/${game.value}/data.json`)
      data.value = data_re.default
      const types_re = await import(`../data/${game.value}/types.json`)
      types.value = types_re.default
      const config_re = await import(`../data/${game.value}/config.json`)
      config.value = config_re.default
      setPageIcon()
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }
}
// 监听路由参数变化并重新加载数据
watchEffect(loadData)

/** 判断是否是手机 */
const isMobileDevice = computed(() => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileUA = /mobile|iP|android/.test(userAgent)
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches
  return isMobileUA || isSmallScreen
})
</script>


<template>
  <a-layout class="page-layout">
    <a-layout-content class="page-content">
      <a-flex vertical justify="center" align="flex-start">
        <video v-if="data && data[videoId]" :key="data[videoId].src" controls autoplay :poster="data[videoId].post"
          style="width: 100%;height: auto;">
          <source :src="data[videoId].src" :key="data[videoId].src" type="video/mp4">
        </video>
        <h2 v-if="data && data[videoId]" style="padding-top: 10px;">{{ data[videoId].title }}</h2>
        <a-flex>
          <p v-if="data && data[videoId]">{{ data[videoId].time }}</p>
          <p v-if="data && data[videoId]">{{ data[videoId].intro }}</p>
        </a-flex>
        <VideoActionButtons :data="data" :videoId="videoId" :types="types" :game="game" :config="config" />
        <MoreVideo v-if="isMobileDevice" :data="data" :videoId="videoId" :types="types" />
      </a-flex>
    </a-layout-content>
    <a-layout-sider v-if="!isMobileDevice" width="340" class="content-sider">
      <MoreVideo :data="data" :videoId="videoId" :types="types" />
    </a-layout-sider>
  </a-layout>
</template>

<style scoped>
.page-layout {
  height: 100%;
  background: transparent;
}

.page-content {
  line-height: 1 !important;
  padding: 24px 24px 0 24px;
}

.content-sider {
  background-color: white;
  border-inline-end: 1px solid rgba(5, 5, 5, 0.06);
}
</style>