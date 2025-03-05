<script setup>
import Card from "../components/Card.vue"
import { reactive, ref, computed, watchEffect, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import gameData from "../data/data.json"

const route = useRoute()
const router = useRouter()
const game = computed(() => route.params.game)
const games = reactive(gameData.games)
const segmentedValue = ref(game.value)
watch(segmentedValue, (newValue) => {
  console.log(`${segmentedValue} - ${newValue}`)
  router.push(`/${newValue}`)
})

const data = ref(null)
const types = ref(null)
const typeList = ref([])
const iconPath = computed(() => {
  return new URL(`../assets/icons/${game.value}.png`, import.meta.url).href
})
const setPageIcon = () => {
  // 设置页面标题
  document.title = `${game.value}`

  // 设置页面图标
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.rel = 'icon'
  link.href = iconPath.value
  document.head.appendChild(link)
}
// 动态导入 JSON 文件
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

const handleCardClick = (video_type) => {
  router.push({
    name: 'SpecificType',  // 使用命名路由
    params: { game: game.value },
    query: { type: video_type }
  })
}
</script>


<template>
  <div class="page-container">
    <div class="header-wrapper">
      <a-segmented v-model:value="segmentedValue" block :options="games" class="segmented-header" />
    </div>
    <div class="content-wrapper">
      <a-flex wrap="wrap" gap="middle" class="specific-type-content">
        <Card v-for="item in (typeList || [])" :key="item.post" v-if="data && types" :cover="item.post"
          :type-name="item.type_name" @click="handleCardClick(item.type_name)" style="height: fit-content;" />
      </a-flex>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-wrapper {
  padding: env(safe-area-inset-top) 0 10px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.segmented-header {
  width: 80vw;
  margin: 20px auto 0;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.specific-type-content {
  padding: 20px;
}
</style>