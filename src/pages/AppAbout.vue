<script setup lang="ts">
import { h, onMounted, ref, reactive, watchEffect } from "vue"
import { IconMail } from '@tabler/icons-vue'
import { QqIcon, XiaohongshuIcon, TelegramIcon, AfdianIcon } from "vue3-simple-icons"

// 更新时间
import { fetchUpdateTime } from "@/utils/useData"
const update_time = ref('')
onMounted(async () => {
    try {
        const rawTime = await fetchUpdateTime()
        const date = new Date(rawTime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        update_time.value = `${year}年${month}月${day}日`
    } catch (err) {
        console.error('获取更新时间失败', err)
    }
})

// Umami 统计数据
// 访问量
const view_data = reactive({
    views: {
        label: '浏览量',
        value: ref(0)
    },
    visitors: {
        label: '访客',
        value: ref(0)
    },
    visits: {
        label: '访问次数',
        value: ref(0)
    }
})
// 折线图数据
const chartLabels = ref<string[]>([])
const visitorDatasets = ref<number[]>([])
const visitDatasets = ref<number[]>([])
// 获取数据
import { fetchUmamiData } from "@/utils/useData"
onMounted(async () => {
    const [viewsData, chartData] = await fetchUmamiData()
    view_data.views.value = viewsData.views
    view_data.visitors.value = viewsData.visitors
    view_data.visits.value = viewsData.visits
    chartLabels.value = chartData.chartLabels
    visitorDatasets.value = chartData.visitorDatasets
    visitDatasets.value = chartData.visitDatasets
})

// 设置折线图
import Chart from 'chart.js/auto'
import type { ChartData } from 'chart.js'
const chartData = ref<ChartData<'bar', (number | [number, number] | null)[], string>>({
    labels: [],
    datasets: []
})
const setChart = async () => {
    if (chartLabels.value && visitorDatasets.value && visitDatasets.value) {
        chartData.value = {
            labels: chartLabels.value,
            datasets: [
                {
                    label: '访客',
                    data: visitorDatasets.value,
                    backgroundColor: 'rgba(90, 158, 240, 0.8)',
                    borderColor: 'rgb(90, 158, 240)',
                },
                {
                    label: '浏览量',
                    data: visitDatasets.value,
                    backgroundColor: 'rgba(90, 158, 240, 0.5)',
                    borderColor: 'rgb(90, 158, 240)',
                },
            ],
        }
    }
    const el = document.getElementById('dataChart')
    if (el instanceof HTMLCanvasElement && chartData.value) {
        new Chart(el, {
            type: 'bar',
            data: chartData.value,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                        position: 'top',
                    },
                    title: {
                        display: false,
                        text: '',
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        stacked: true
                    },
                },
            },
        })
    }
}
watchEffect(async () => { await setChart() })

// 读取更新日志
const updateLog = ref({})
onMounted(async () => {
    updateLog.value = (await import('../assets/update_log.json')).default
})

// 获取屏幕宽度
import { useScreenWidth } from '@/utils/useScreenWidth'
const { screenWidth } = useScreenWidth()

// 版权声明
const copyrightNotice = ["项目中的视频内容和图片资源版权归米哈游所有", "本项目仅作为这些内容的展示工具，不对这些资源进行任何权利声明"]
// 联系方式
const contactInformation = [
    {
        name: "邮箱",
        href: "mailto:wzhhenry@qq.com",
        icon: IconMail
    },
    {
        name: "QQ群",
        href: "https://qm.qq.com/q/6l9M3S5YUU",
        icon: QqIcon
    },
    {
        name: "小红书",
        href: "https://xhslink.com/m/1pZ5r6t3ic5",
        icon: XiaohongshuIcon
    },
    {
        name: "纸飞机",
        href: "https://t.me/+HPqoqfsLukI3YTVl",
        icon: TelegramIcon
    },
    {
        name: "爱发电",
        href: "https://afdian.com/a/trrrrw",
        icon: AfdianIcon
    }
]
</script>

<template>
    <div class="scrollable-container w-full h-full">
        <a-space class="w-full h-full" :size="16" direction="vertical"
            :style="{ padding: screenWidth <= 768 ? '24px' : '50px 80px' }">
            <a-row :wrap="true" :gutter="[16, 16]">
                <a-col :flex="1">
                    <a-card>
                        <a-statistic title="更新日期" :value="update_time" />
                    </a-card>
                </a-col>
                <a-col :flex="1" v-for="(item, _) in view_data">
                    <a-card>
                        <a-statistic :title="item.label" :value="item.value" />
                    </a-card>
                </a-col>
            </a-row>
            <a-row>
                <a-col :flex="1">
                    <a-card>
                        <canvas id="dataChart" width="100%" height="300" />
                    </a-card>
                </a-col>
            </a-row>
            <!-- <a-flex wrap gap="16" style="padding-bottom: 24px;"> -->
            <a-row :wrap="true" :gutter="[16, 16]" :style="{ paddingBottom: screenWidth <= 768 ? '24px' : '50px' }">
                <a-col :flex="1" class="h-full" style="height:540px;">
                    <a-card class="no-statistic-content h-full" :bodyStyle="{ height: '100%' }">
                        <a-statistic title="更新日志" value="" />
                        <div class="update-log" style="height: 95%; padding-top: 20px;">
                            <a-timeline v-if="updateLog">
                                <a-timeline-item v-for="(log, time) in updateLog">{{ time }} {{ log }}</a-timeline-item>
                            </a-timeline>
                        </div>
                    </a-card>
                </a-col>
                <a-col :flex="1" class="h-full" style="height:540px;">
                    <a-flex :size="16" vertical gap="16" class="w-full h-full">
                        <a-card class="no-statistic-content w-full h-full">
                            <a-statistic title="版权声明" value="" />
                            <a-flex vertical gap="small" style="padding-top: 20px;">
                                <a-alert v-for="message in copyrightNotice" :message="message" type="error" />
                            </a-flex>
                        </a-card>
                        <a-card class="no-statistic-content w-full h-full">
                            <a-statistic title="联系方式" value="" />
                            <a-flex wrap="wrap" gap="small" style="padding-top: 20px;">
                                <a-button v-for="contact in contactInformation" :href="contact.href"
                                    :icon="h(contact.icon)">{{
                                        contact.name }}</a-button>
                            </a-flex>
                        </a-card>
                    </a-flex>
                </a-col>
            </a-row>
            <!-- </a-flex> -->
        </a-space>
    </div>
</template>

<style lang="css" scoped>
.no-statistic-content:deep(.ant-statistic-content) {
    display: none;
}

:deep(.ant-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
}

svg {
    height: 75%;
}

.update-log {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
}

.update-log::-webkit-scrollbar {
    display: none;
}
</style>
