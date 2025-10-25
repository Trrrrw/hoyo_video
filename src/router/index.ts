import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { fetchGameList } from '@/utils/useData'

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Layout',
        component: () => import('@/Layout.vue'),
        children: [
            {
                path: '/',
                name: 'AppHome',
                component: () => import('@/pages/AppHome.vue')
            },
            {
                path: '/:game',
                name: 'VideoCategory',
                component: () => import('@/pages/VideoCategory.vue'),
                beforeEnter: async (to, from, next) => {
                    const games = await fetchGameList()
                    const game_list = games.map(g => g.name)
                    const gameParam = to.params.game as string
                    if (!game_list.includes(gameParam)) { next({ name: 'AppNotFound' }) }
                    else if (to.query.type) {
                        const query = {
                            ...to.query,
                            page: to.query.page || '1',
                            pageSize: to.query.pageSize || '20'
                        }
                        next({ name: 'VideoList', params: { game: to.params.game }, query })
                    } else {
                        next()
                    }
                }
            },
            {
                path: '/:game',
                name: 'VideoList',
                component: () => import('@/pages/VideoList.vue')
            },
            {
                path: '/:game/video',
                name: 'VideoPlayer',
                component: () => import('@/pages/VideoPlayer.vue')
            },
            {
                path: '/about',
                name: 'AppAbout',
                component: () => import('@/pages/AppAbout.vue')
            },
            {
                path: 'search',
                name: 'AppSearch',
                component: () => import('@/pages/AppSearch.vue')
            },
            {
                path: '/:pathMatch(.*)*',
                redirect: '/404'
            },
            {
                path: '404',
                name: 'AppNotFound',
                component: () => import('@/pages/AppNotFound.vue')
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
})

export default router
