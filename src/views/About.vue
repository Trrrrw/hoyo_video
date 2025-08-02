<script setup>
import { h, ref, watchEffect } from 'vue'
import { QqOutlined, MailOutlined } from '@ant-design/icons-vue'
import { setMetaDescription } from '../utils/setMetaDescription'
import { updatePageTitleAndIcon } from '../utils/updatePageTitleAndIcon'
import { formatInTimeZone } from 'date-fns-tz'
import { zhCN } from 'date-fns/locale'
import Chart from 'chart.js/auto'
import { IconFont } from '../utils/iconFont'

const udpateTime = ref(new Date().getTime())
const views = ref(0)
const visitors = ref(0)
const visits = ref(0)
const chartLabels = ref([])
const visitorDatasets = ref([])
const visitDatasets = ref([])
const chartData = ref({})
const updateLog = ref({})

const fetchData = async (url, method = 'GET', data = null) => {
    const headers = {
        'authorization': 'Bearer xQsc18bnNkUpWk3JGdYv6Aex4hjftuD5VW7b9O4jNx5Q1x928T9JqyhkUsqn8+HvblkGvjmWS3FgfCqvqIw5cYsoyo4rdpoxVcE5ie3pYTVO5dPEb2pX8ZIZS2hyMO7o/DoXEBC8J20KbxbWUUUX2MarBsY3+38GNc8sbDsMWgG+SPQEgF6pJ4njKu7SEeypAsmj/sA8vRYkHf/h1KIzr0VJ4yXYLCr0h7DOVjX6/Wp7FeD/ZmqEExs55Q+hQ8D8bq/3bNe9aONGqQa8RwpzIuZXdqgc9ejQs2T0VT3z+zf+bQcKZGE/0fNMdIiFVaG/EReiUvqr5NooxrmplLJnDCZUZMCNuUw15BS/kxXtQPyqpRuESFZFK3C4SA9i',
        'cookie': '_clck=fgs6kc%7C2%7Cfva%7C0%7C1938; cf_clearance=ixOAvmzI16FnGHas3KZg7x16oXsmMNlIn7MaMyaSRF8-1750647801-1.2.1.1-net_AWx9MPuBiAH5oVFz.LeOJUyPTKkDrC46c4zY8VzOLGvQqQU9Gl8oXjPs1eSQn6pYuDNtC4dWH.hA71fX_2AGuia2mnqQfQ_QQuQJ__KqnmDJqF9eeAatAe8kOnkkiPiPU.Oo8xTpvB7fkb_nVzF24QIAAmg6O3u97xQRNCQU_5CAm.v._EzMpWqroVu0Xtg_ZpPYZpkm.1qGk_9uOLVktEVaHKOzV4PxnYmlfJ1t6nmoOWzufhatyqenncYClgXhPLaK5hbkLiyr31u_gR8j4A_DIqtUAka5n7JBKtsTKVgVYAbsKFpsVkVKVuC53IpfUQoQCSDfmJ.oKnsQ7Hj9uIGxuSGUSC72EuiAmhs'
    }
    if (method === 'GET') {
        try {
            const res = await fetch(url, { headers: headers })
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
                    'Content-Type': 'application/json',
                    ...headers
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

    // 更新日志
    updateLog.value = (await import(`../data/update_log.json`)).default

    // 访问量
    const viewsData = await fetchData('https://umami.trrw.tech/api/websites/4f5de7ac-459b-4481-8011-5c27fc8759a3/stats?startAt=1751558400000&endAt=1752163199999&unit=day&timezone=Asia%2FShanghai&compare=false')
    views.value = viewsData.pageviews.value
    visitors.value = viewsData.visitors.value
    visits.value = viewsData.visits.value

    // 折线图数据
    const chartDataRe = await fetchData('https://umami.trrw.tech/api/websites/4f5de7ac-459b-4481-8011-5c27fc8759a3/pageviews?startAt=1751558400000&endAt=1752163199999&unit=day&timezone=Asia%2FShanghai')
    chartLabels.value = chartDataRe.sessions.map(item => item.x.replace(/^\d{4}-(\d{2}-\d{2}).*$/, '$1'))
    visitorDatasets.value = chartDataRe.sessions.map(item => item.y)
    visitDatasets.value = chartDataRe.pageviews.map(item => item.y)
    setChart()
}

const setChart = async () => {
    if (chartLabels.value && visitorDatasets.value) {
        chartData.value = {
            labels: chartLabels.value,
            datasets: [
                {
                    label: '访客',
                    data: visitorDatasets.value,
                    fill: false,
                    backgroundColor: 'rgba(90, 158, 240, 0.8)',
                    borderColor: 'rgb(90, 158, 240)',
                    tension: 0.3
                },
                {
                    label: '浏览量',
                    data: visitDatasets.value,
                    fill: false,
                    backgroundColor: 'rgba(90, 158, 240, 0.5)',
                    borderColor: 'rgb(90, 158, 240)',
                    tension: 0.3
                },
            ],
        }
    }

    const ctx = document.getElementById('dataChart')
    if (ctx && chartData.value) {
        new Chart(ctx, {
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

watchEffect(() => {
    loadDate()
    updatePageTitleAndIcon('关于 | 影像档案架', '/favicon.ico')
    setMetaDescription(`关于 | 影像档案架`)
})
</script>

<template>
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
                    <a-statistic title="浏览量" :value="views">
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :flex="1">
                <a-card>
                    <a-statistic title="访客" :value="visitors">
                    </a-statistic>
                </a-card>
            </a-col>
            <a-col :flex="1">
                <a-card>
                    <a-statistic title="访问次数" :value="visits">
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
                        <a-button href="mailto:wzhhenry@qq.com" :icon="h(MailOutlined)"
                            style="text-align: left;">邮箱</a-button>
                        <a-button href="https://qm.qq.com/q/6l9M3S5YUU" :icon="h(QqOutlined)" target="_blank"
                            style="text-align: left;">QQ 群</a-button>
                        <a-button href="https://t.me/+wPOm4o0FOJw5MzU1" :icon="h(IconFont, { type: 'icon-telegram' })" target="_blank"
                            style="text-align: left;">纸飞机</a-button>
                        <a-button href="https://afdian.com/a/trrrrw" :icon="h(IconFont, { type: 'icon-aifadian' })"
                            target="_blank" style="text-align: left;">爱发电</a-button>
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
