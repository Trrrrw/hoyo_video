<script setup>
import Card from "../components/Card.vue"
import Footer from "../components/Footer.vue"
import { ref, computed, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"
import { message } from 'ant-design-vue';

const route = useRoute()
const router = useRouter()
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

/** 处理卡片的点击 */
const handleCardClick = (itemId) => {
  router.push({ path: `/${game.value}/video`, query: { id: itemId } })
}

/** 点击返回按钮 */
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
/** 点击下载按钮 */
const downloadButtonClick = () => {
  if (data.value && videoId.value && data.value[videoId.value]) {
    const videoUrl = data.value[videoId.value].src
    const videoTitle = data.value[videoId.value].title
    const extension = videoUrl.split('.').pop() // 获取文件后缀
    // 创建一个临时的 a 标签用于下载
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = `${videoTitle}.${extension}` // 设置下载文件名
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
/** 点击分享按钮 */
const shareButtonClick = () => {
  //复制当前链接
  const currentUrl = window.location.href;
  const tempTextarea = document.createElement('textarea'); // 创建一个临时的 textarea 元素
  tempTextarea.value = currentUrl; // 设置 textarea 的值为当前链接
  document.body.appendChild(tempTextarea); // 将 textarea 添加到文档中
  tempTextarea.select(); // 选择 textarea 的内容
  document.execCommand('copy'); // 复制内容到剪贴板
  document.body.removeChild(tempTextarea); // 移除 textarea 元素
  message.info('已复制链接');
}
/** 打开官网链接 */
const openOfficialWebsite = (url) => {
  window.open(url, '_blank');
}
/** 格式化卡片标题 */
const formatTitle = computed(() => {
  if (!data.value || !types.value) return ''
  return (itemId) => {
    const title = data.value[itemId].title
    if (title == '《绝区零》×《街霸6》制作人对谈') return title
    const result = title
      .replace(`《${game.value}》——`, '') // 游戏名
      .replace(`《${game.value}》`, '') // 游戏名
      .trim()
    if (result === '') return title
    return result
  }
})
</script>


<template>
  <a-layout class="page-layout">
    <a-flex wrap="wrap" justify="center" gap="small" class="video-playback-container">
      <!-- 左侧内容 -->
      <a-flex flex="1" justify="flex-start" align="flex-start" vertical class="left-content">
        <h2 v-if="data && data[videoId]">{{ data[videoId].title }}</h2>
        <a-flex>
          <p v-if="data && data[videoId]">{{ data[videoId].time }}</p>
          <a-divider type="vertical" />
          <p v-if="data && data[videoId]">{{ data[videoId].intro }}</p>
        </a-flex>
        <video v-if="data && data[videoId]" :key="data[videoId].src" controls autoplay :poster="data[videoId].post">
          <source :src="data[videoId].src" :key="data[videoId].src" type="video/mp4">
        </video>
        <div class="button-group">
          <a-row :gutter="16">
            <a-col class="gutter-row" :span="6">
              <a-button class="gutter-box" @click="goBack">返回</a-button>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-button class="gutter-box" @click="downloadButtonClick">下载</a-button>
            </a-col>
            <a-col class="gutter-row" :span="6">
              <a-button class="gutter-box" @click="shareButtonClick">分享</a-button>
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
                :cover="data[itemId].post" :title="formatTitle(itemId)" @click="handleCardClick(itemId)" />
            </a-flex>
          </a-card>
        </div>
      </a-flex>
    </a-flex>
    <a-layout-footer class="page-footer">
      <Footer></Footer>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.page-layout {
  height: 100%;
  background: none;
}

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
  padding: 10px;
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

.page-footer {
  text-align: center;
  height: 38px;
  padding: 0px 0px;
  background-color: transparent;
}
</style>