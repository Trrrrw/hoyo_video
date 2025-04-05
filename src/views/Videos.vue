<script setup>
import Card from "../components/Card.vue"
import { ref, computed, watchEffect, h } from "vue"
import { useRoute, useRouter } from "vue-router"
import { LeftOutlined } from '@ant-design/icons-vue'
import TopMenuBar from "../components/TopMenuBar.vue"
const route = useRoute()
const router = useRouter()
const game = computed(() => route.params.game)
const type = computed(() => route.query.type)
const data = ref(null)
const types = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)
const iconPath = computed(() => {
  return new URL(`../assets/icons/${game.value}.png`, import.meta.url).href
})

/** 设置页面标题和图标 */
const setPageIcon = () => {
  document.title = `${type.value} | ${game.value}`// 设置页面标题
  // 设置页面图标
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.rel = 'icon'
  link.href = iconPath.value
  document.head.appendChild(link)
}
/** 动态导入 JSON 文件 */
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

/** 处理卡片的点击 */
const handleCardClick = (itemId) => {
  router.push({ path: `/${game.value}/video`, query: { id: itemId } })
}
/** 点击图标返回上级 */
const goBack = () => {
  router.push({ path: `/${game.value}` })
}
/** 格式化卡片标题 */
const formatTitle = computed(() => {
  if (!data.value || !types.value) return ''
  return (itemId) => {
    const title = data.value[itemId].title
    if (title == '《绝区零》×《街霸6》制作人对谈') return title
    if (['其他', '幕后', 'CM短片'].includes(type.value)) return title
      .replace(`《${game.value}》——`, '') // 游戏名
      .replace(`《${game.value}》`, '') // 游戏名
      .trim()
    const result = title
      .replace(`《${game.value}》——`, '') // 游戏名
      .replace(`《${game.value}》`, '') // 游戏名
      .replace(`全新${type.value}-`, '')// 菲谢尔角色预告
      .replace(`${type.value}-`, '')
      .replace(`${type.value}———`, '')
      .replace(`${type.value}——`, '')
      .replace(`${type.value}—`, '')
      .replace(`${type.value}：`, '')
      .replace(`「${type.value}」——`, '')//流光拾遗之旅
      .replace(`「${type.value}」`, '') // 璃月雅集
      .replace(`声优小剧场——`, '') // 璃月雅集
      .replace(`小剧场——`, '') // 璃月雅集
      .replace(`${type.value} | `, '')
      .replace(`${type.value}丨`, '')
      .replace(`特别${type.value} - `, '') // EP
      .replace(`${type.value} - `, '') // EP
      .replace(`${type.value} ：`, '') // EP
      .replace(`${type.value}PV：`, '') //千星纪游
      .replace(`${type.value}回顾`, '')
      .replace(`提瓦特风尚·`, '')
      .replace(`——${type.value}SP`, '')
      .replace(`${type.value}`, '')
      .trim()
    if (result === '') return title
    return result
  }
})
</script>


<template>
  <a-layout class="page-layout">
    <a-layout class="page-layout">
      <a-layout-header class="page-header">
        <a-flex align="center">
          <a-button :icon="h(LeftOutlined)" @click="goBack"></a-button>
          <TopMenuBar />
        </a-flex>
      </a-layout-header>
      <a-layout-content class="page-content scrollable-container">
        <a-flex wrap="wrap" justify="flex-start" gap="middle">
          <Card v-for="itemId in (types[type] || []).slice((currentPage - 1) * pageSize, currentPage * pageSize)"
            :key="itemId" v-if="data && types" :cover="data[itemId].post" :title="formatTitle(itemId)"
            @click="handleCardClick(itemId)" style="height: fit-content;" />
        </a-flex>
      </a-layout-content>
      <a-layout-footer class="pagination">
        <a-pagination v-model:current="currentPage" v-model:pageSize="pageSize" show-size-changer
          :total="types && type ? types[type].length : 0" />
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.page-layout {
  height: 100%;
  background: none;
}

.page-header {
  padding-inline: 0;
  line-height: 64px;
  background-color: transparent;
}


.page-content {
  height: 100%;
  min-height: 120;
  line-height: 120px;
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

.pagination {
  background-color: transparent;
}
</style>