import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "./assets/styles/main.css"
import { createHead } from "@vueuse/head"

// 提前预加载游戏列表
import { fetchGameList } from "@/utils/useData"
await fetchGameList()


const head = createHead()
const app = createApp(App)

app.use(head)
app.use(router)

app.mount('#app')
