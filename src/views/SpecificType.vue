<script setup>
import Card from "../components/Card.vue"
import { ref, computed, watchEffect, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useDark } from '@vueuse/core'

const route = useRoute()
const router = useRouter()
const isDark = useDark()
const game = computed(() => route.params.game)
const type = computed(() => route.query.type)
const data = ref(null)
const types = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)
const iconPath = computed(() => {
  return new URL(`../assets/icons/${game.value}.png`, import.meta.url).href
})
const logoPath = computed(() => {
  return new URL(`../assets/logos/${game.value}.svg`, import.meta.url).href
})

const setPageIcon = () => {
  // 设置页面标题
  document.title = `${type.value} - ${game.value}`

  // 设置页面图标
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.rel = 'icon'
  link.href = iconPath.value
  document.head.appendChild(link)
}
// 动态导入 JSON 文件
const loadData = async () => {
  if (game.value && type.value) {
    try {
      const response = await import(`../data/${game.value}/data.json`)
      data.value = response.default
      const response_types = await import(`../data/${game.value}/types.json`)
      types.value = response_types.default
      setPageIcon()
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }
}
// 监听路由参数变化并重新加载数据
watchEffect(loadData)

const handleCardClick = (itemId) => {
  router.push({ path: `/${game.value}/video`, query: { id: itemId } })
}
const goBack = () => {
  router.push({ path: `/${game.value}` })
}
const formatTitle = computed(() => {
  if (!data.value || !types.value) return ''
  return (itemId) => {
    const title = data.value[itemId].title
    if (title == '《绝区零》×《街霸6》制作人对谈') return title
    if (type.value == '其他' | type.value == '幕后') return title
      .replace(`《${game.value}》——`, '') // 游戏名
      .replace(`《${game.value}》`, '') // 游戏名
      .trim()
    const result = title
      .replace(`《${game.value}》——`, '') // 游戏名
      .replace(`《${game.value}》`, '') // 游戏名
      .replace(`${type.value}-`, '')
      .replace(`${type.value}———`, '')
      .replace(`${type.value}——`, '')
      .replace(`${type.value}—`, '')
      .replace(`${type.value}：`, '')
      .replace(`「${type.value}」——`, '')
      .replace(`${type.value} | `, '')
      .replace(`${type.value}丨`, '')
      .replace(`特别${type.value} - `, '') // EP
      .replace(`${type.value} - `, '') // EP
      .replace(`${type.value} ：`, '') // EP
      .replace(`${type.value}PV：`, '') //千星纪游
      .replace(`${type.value}`, '')
      .trim()
    if (result === '') return title
    return result
  }
})
const onShowSizeChange = (currentPage, pageSize) => {
  console.log(currentPage, pageSize)
}
watch(pageSize, () => {
  console.log('pageSize', pageSize.value)
})
watch(currentPage, () => {
  console.log('currentPage', currentPage.value)
})
</script>


<template>
  <div class="page-container">
    <div class="header-wrapper">
      <a-flex flex="1" align="center" class="specific-type-header">
        <img v-if="game !== `崩坏：星穹铁道`" :src="logoPath" alt="logo" @click="goBack"
          :class="['game-logo', { 'invert': isDark }]" />
        <img v-else :src="logoPath" alt="logo" @click="goBack" class="game-logo no-filter" />
        <a-divider type="vertical" style="height: 60%;" />
        <h2 class="type-h1">{{ type }}</h2>
      </a-flex>
    </div>
    <div class="content-wrapper">
      <a-flex wrap="wrap" gap="middle" class="specific-type-content">
        <Card v-for="itemId in (types[type] || []).slice((currentPage - 1) * pageSize, currentPage * pageSize)"
          :key="itemId" v-if="data && types" :cover="data[itemId].post" :title="formatTitle(itemId)"
          @click="handleCardClick(itemId)" style="height: fit-content;" />
      </a-flex>
    </div>
    <div class="footer-wrapper">
      <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" show-size-changer
        :total="types && type ? types[type].length : 0" @showSizeChange="onShowSizeChange" />
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
  position: sticky;
  top: 0;
  z-index: 10;
}

.specific-type-header {
  margin-top: max(20px, env(safe-area-inset-top));
  padding: 0 20px;
}

.game-logo {
  height: 9em;
  padding: 1.5em;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.content-wrapper ::-webkit-scrollbar {
  display: none;
}

.content-wrapper {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.specific-type-content {
  padding: 10px;
  width: 100%;
}

.footer-wrapper {
  padding: 20px 0;
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
}

/* 其他样式保持不变 */
.invert {
  filter: invert(1);
}

.no-filter {
  filter: none;
}

.type-h1 {
  padding-top: 12px;
}
</style>