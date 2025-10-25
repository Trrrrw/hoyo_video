import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "./assets/styles/main.css"
import { createHead } from "@vueuse/head"

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const head = createHead()
const app = createApp(App)

app.use(head)
app.use(Antd)
app.use(router)

app.mount('#app')
