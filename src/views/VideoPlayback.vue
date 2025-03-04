<script setup>
import Card from "../components/Card.vue"
import { useRoute, useRouter } from "vue-router"
import { ref, computed, watchEffect } from "vue"

const route = useRoute()
const router = useRouter()
const game = computed(() => route.params.game)
const videoId = computed(() => route.query.id)
// 动态导入 JSON 文件
const data = ref(null)
const types = ref(null)
const config = ref(null)
const setPageIcon = () => {
  // 设置页面标题
  document.title = `视频 - ${game.value}`
  
  // 设置页面图标
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
  link.rel = 'icon'
  link.href = `/src/assets/icons/${game.value}.png`  // 确保有对应的 .ico 文件
  document.head.appendChild(link)
}
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

const handleCardClick = (itemId) => {
  router.push({ path: `/${game.value}/video`, query: { id: itemId } })
}
const goBack = () => {
  const currentType = computed(() => {
    if (!types.value || !videoId.value) return null
    for (const [type, ids] of Object.entries(types.value)) {
      if (ids.includes(Number(videoId.value))) {
        return type
      }
    }
    return null
  })
  router.push({ path: `/${game.value}`, query: { type: currentType.value } })
}
const openOfficialWebsite = (url) => {
  window.open(url, '_blank');
}
</script>


<template>
  <a-flex wrap="wrap" gap="small" class="video-playback-container">
    <!-- 左侧内容 -->
    <a-flex flex="1" justify="flex-start" align="flex-start" vertical class="left-content">
      <h2 v-if="data && data[videoId]">{{ data[videoId].title }}</h2>
      <a-flex>
        <p v-if="data && data[videoId]">{{ data[videoId].time }}</p>
        <a-divider type="vertical" />
        <p v-if="data && data[videoId]">{{ data[videoId].intro }}</p>
      </a-flex>
      <video v-if="data && data[videoId]" :key="data[videoId].src" controls muted :poster="data[videoId].post">
        <source :src="data[videoId].src" :key="data[videoId].src" type="video/mp4">
      </video>
      <div class="button-group">
        <a-row :gutter="16">
          <a-col class="gutter-row" :span="6">
            <a-button class="gutter-box" @click="goBack">返回</a-button>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-button class="gutter-box">下载</a-button>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-button class="gutter-box">分享</a-button>
          </a-col>
          <a-col class="gutter-row" :span="6">
            <a-button class="gutter-box"
              @click="openOfficialWebsite(`${config['news_detail_url']}${videoId}`)">官网</a-button>
          </a-col>
        </a-row>
      </div>
    </a-flex>

    <!-- 右侧内容 -->
    <a-flex vertical class="right-content">
      <a-divider>更多视频</a-divider>
      <div class="scrollable-container">
        <a-card class="video-card-list">
          <a-flex gap="middle" vertical>
            <Card v-for="itemId in types[data[videoId]?.type] || []" :key="itemId" v-if="data && data[videoId]"
              :cover="data[itemId].post" :type-name="data[itemId].title" @click="handleCardClick(itemId)" />
          </a-flex>
        </a-card>
      </div>
    </a-flex>
  </a-flex>
</template>

<style scoped>
/* 容器 */
.video-playback-container {
  height: 100vh;
}

/* 左侧内容 */
.left-content {
  flex-direction: column;
  padding: 20px;
}

.left-content video {
  width: 100%;
  margin-bottom: 20px;
  background-color: black;
}

/* 右侧内容 */
.right-content {
  height: 90vh;
  /* 高度等于视口高度 */
  padding: 20px;
}

/* 滚动容器 */
.scrollable-container {
  flex: 1;
  /* 占据剩余空间 */
  overflow-y: auto;
  /* 允许垂直滚动 */
  overflow-x: hidden;
  /* 禁止水平滚动 */
  margin-top: 10px;
  /* 与标题保持间距 */
}

.video-card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* 设置卡片之间的间距 */
  width: 100%;
  /* 确保列表宽度与父容器一致 */
}


/* 隐藏滚动条 */
.scrollable-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari and Opera */
}

.scrollable-container {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>