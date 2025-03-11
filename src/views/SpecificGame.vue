<script setup>
import Card from "../components/Card.vue"
import Footer from "../components/Footer.vue"
import { reactive, ref, computed, watchEffect, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import gameData from "../data/data.json"

const route = useRoute()
const router = useRouter()
const game = computed(() => route.params.game)
const games = reactive(gameData.games)
const segmentedValue = ref(game.value)
const data = ref(null)
const types = ref(null)
const typeList = ref([])
const iconPath = computed(() => {
  return new URL(`../assets/icons/${game.value}.png`, import.meta.url).href
})

/** 设置页面标题和图标 */
const setPageIcon = () => {
  document.title = `${game.value}`// 设置页面标题
  // 设置页面图标
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.rel = 'icon'
  link.href = iconPath.value
  document.head.appendChild(link)
}
/** 动态导入 JSON 文件 */
const loadData = async () => {
  if (game.value) {
    try {
      const response = await import(`../data/${game.value}/data.json`)
      data.value = response.default
      const response_types = await import(`../data/${game.value}/types.json`)
      types.value = response_types.default
      // 处理类型列表
      typeList.value = Object.entries(types.value)
        .filter(([_, ids]) => ids.length > 0)  // 过滤掉空数组
        .map(([video_type, ids]) => ({
          type_name: video_type,
          post: data.value[ids[0]].post
        }))
      setPageIcon()
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }
}

// 监听路由参数变化并重新加载数据
watchEffect(loadData)
// 监听select和segment选择的游戏
watch(segmentedValue, (newValue) => {
  console.log(`${segmentedValue} - ${newValue}`)
  router.push(`/${newValue}`)
})

/** 处理卡片的点击 */
const handleCardClick = (video_type) => {
  router.push({
    name: 'SpecificType',
    params: { game: game.value },
    query: { type: video_type }
  })
}
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
    <a-layout-header class="page-header">
      <a-select v-if="isMobileDevice" ref="select" v-model:value="segmentedValue" style="width: 100%;">
        <a-select-option v-for="game in games" :value="game">{{ game }}</a-select-option>
      </a-select>
      <a-segmented v-else v-model:value="segmentedValue" block :options="games" />
    </a-layout-header>
    <a-layout-content class="page-content scrollable-container">
      <a-flex wrap="wrap" justify="center" gap="middle">
        <Card v-for="item in (typeList || [])" :key="item.post" v-if="data && types" :cover="item.post"
          :title="item.type_name" @click="handleCardClick(item.type_name)" style="height: fit-content;" />
      </a-flex>
    </a-layout-content>
    <a-layout-footer class="page-footer">
      <Footer></Footer>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.page-layout {
  height: 100%;
}

.page-header {
  height: 64;
  padding-inline: 50;
  line-height: 64px;
  background-color: #fff;
}

.page-content {
  height: 100%;
  min-height: 120;
  line-height: 120px;
  background-color: #fff;
}

.scrollable-container {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.scrollable-container::-webkit-scrollbar {
  display: none;
}

.scrollable-container {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.page-footer {
  text-align: center;
  background-color: #fff;
}
</style>