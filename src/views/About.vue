<script setup>
import { ref, shallowRef, watchEffect } from 'vue'
import { setMetaDescription } from '../utils/setMetaDescription'
import { updatePageTitleAndIcon } from '../utils/updatePageTitleAndIcon'
import { formatInTimeZone } from 'date-fns-tz'
import { zhCN } from 'date-fns/locale'
import Chart from 'chart.js/auto'
import { getColorFromString } from '../utils/getColorFromString'

const udpateTime = ref(new Date().getTime())
const views = ref(0)
const visitors = ref(0)
const visits = ref(0)
const chartLabels = ref([])
const chartDatasets = ref([])
const chartData = ref({})
const updateLog = ref({})

const fetchData = async (url, method = 'GET', data = null) => {
    if (method === 'GET') {
        try {
            const res = await fetch(url)
            const responseData = await res.json()
            return responseData
        } catch (error) {
            console.error('Failed to fetch data:', error)
            return null
        }
    } else if (method === 'POST') {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data ? JSON.stringify(data) : null
            })
            const responseData = await res.json()
            return responseData
        } catch (error) {
            console.error('Failed to post data:', error)
            return null
        }
    }
}

const loadDate = async () => {
    // 上次更新时间
    // const githubCommitData = await fetchData('https://api.github.com/repos/Trrrrw/hoyo_video/commits')
    udpateTime.value = new Date((await import(`../data/data.json`)).default.update_time).getTime()
    console.log(formatInTimeZone(new Date(udpateTime.value), 'Asia/Shanghai', 'yyyy年MM月dd日', { locale: zhCN }))

    // 访问量
    const viewsData = await fetchData('https://han-analytics.trrw.tech/api', 'POST', { type: "visit", siteID: "hoyo_video", time: "7d", session: "" })
    views.value = viewsData.data.views
    visitors.value = viewsData.data.visitor
    visits.value = viewsData.data.visit
    console.log(views.value, visitors.value, visits.value)

    // 折线图数据
    const chartDataRe = await fetchData('https://han-analytics.trrw.tech/api', 'POST', { type: "echarts", siteID: "hoyo_video", time: "7d", session: "" })
    chartLabels.value = chartDataRe.data.map(item => item.name + '日')
    chartDatasets.value = chartDataRe.data.map(item => item.value)
    console.log(chartLabels.value, chartDatasets.value)
    setChart()

    // 更新日志
    updateLog.value = (await import(`../data/update_log.json`)).default
    console.log(updateLog.value)
}

const setChart = async () => {
    if (chartLabels.value && chartDatasets.value) {
        chartData.value = {
            labels: chartLabels.value,
            datasets: [
                {
                    label: '',
                    data: chartDatasets.value,
                    fill: false,
                    borderColor: getColorFromString('Views'),
                    tension: 0.3
                },
            ],
        }
    }
    console.log(chartData.value)

    const ctx = document.getElementById('dataChart')
    if (ctx && chartData.value) {
        new Chart(ctx, {
            type: 'line',
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
                    },
                },
            },
        })
    }
}

watchEffect(() => {
    loadDate()
    updatePageTitleAndIcon('关于 | 影像档案架', '/favicon.ico')
    setMetaDescription(`关于 | 影像档案架`)
})
</script>

<template>
    <!-- <p>更新时间：{{ formatInTimeZone(new Date(udpateTime), 'Asia/Shanghai', 'yyyy年MM月dd日', { locale: zhCN }) }}</p>
    <p>Views: {{ views }} Visitors: {{ visitors }} Visits: {{ visits }}</p> -->
    <a-flex vertical gap="middle" style="margin: 50px 80px;text-align: left;">
        <a-row :wrap="true" :gutter="[24, 16]">
            <a-col :flex="1">
                <a-card>
                    <a-statistic title="更新日期"
                        :value="formatInTimeZone(new Date(udpateTime), 'Asia/Shanghai', 'yyyy年MM月dd日', { locale: zhCN })">
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :flex="1">
                <a-card>
                    <a-statistic title="Views" :value="views">
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :flex="1">
                <a-card>
                    <a-statistic title="Visitors" :value="visitors">
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :flex="1">
                <a-card>
                    <a-statistic title="Visits" :value="visits">
                    </a-statistic>
                </a-card>
            </a-col>
        </a-row>
        <a-card>
            <canvas id="dataChart" width="100%" height="300" />
        </a-card>
        <a-row :wrap="true" :gutter="[24, 16]">
            <a-col :flex="1">
                <a-card class="no-statistic-content" style="height: 500px;">
                    <a-statistic title="更新日志" value="" />
                    <a-timeline v-if="updateLog" style="margin-top: 20px;">
                        <a-timeline-item v-for="(log, time) in updateLog">{{ time }} {{ log }}</a-timeline-item>
                    </a-timeline>
                </a-card>
            </a-col>
            <a-col :flex="1" :span="24">
                <a-card class="no-statistic-content" style="height: 245px; margin: 0 0 10px 0;">
                    <a-statistic title="版权声明" value="" />
                    <a-flex vertical gap="small" style="margin-top: 20px;">
                        <a-alert message="项目中的视频内容和图片资源版权归米哈游所有" type="error" />
                        <a-alert message="本项目仅作为这些内容的展示工具，不对这些资源进行任何权利声明" type="error" />
                    </a-flex>
                </a-card>
                <a-card class="no-statistic-content" style="height: 245px;">
                    <a-statistic title="联系方式" value="" />
                    <a-flex wrap="wrap" gap="small" style="margin-top: 20px;">
                        <a-button href="mailto:wzhhenry@qq.com" style="text-align: left;">邮箱</a-button>
                        <a-button href="https://qm.qq.com/q/6l9M3S5YUU" style="text-align: left;">QQ 群</a-button>
                    </a-flex>
                </a-card>
            </a-col>
        </a-row>
    </a-flex>
</template>

<style scoped>
.no-statistic-content:deep(.ant-statistic-content) {
    display: none;
}
</style>
