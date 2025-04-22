import { reactive } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import Types from "../views/Types.vue"
import Videos from "../views/Videos.vue"
import Player from "../views/Player.vue"
import About from '../views/About.vue'
import Search from '../views/Search.vue'
import LatestUpdates from '../views/LatestUpdates.vue'
import BasicLayout from '../views/BasicLayout.vue'
import NotFound from '../views/NotFound.vue'

import gamesListData from "../data/data.json"
const gamesList = reactive(gamesListData.games)

const routes = [
    {
        path: '/',
        name: 'Home',
        // redirect: '/原神',
        component: BasicLayout,
        children: [
            {
                path: '/',
                name: 'LatestUpdates',
                component: LatestUpdates,
            },
            {
                path: '/:game',
                name: 'Types',
                component: Types,
                beforeEnter: (to, from, next) => {
                    if (!gamesList.includes(to.params.game)) { next({ name: 'NotFound' }) }
                    else if (to.query.type) {
                        const query = {
                            ...to.query,
                            page: to.query.page || '1',
                            pageSize: to.query.pageSize || '20'
                        }
                        next({ name: 'Videos', params: { game: to.params.game }, query })
                    } else {
                        next()
                    }
                }
            },
            {
                path: '/:game',
                name: 'Videos',
                component: Videos,
            },
            {
                path: '/:game/video',
                name: 'Player',
                component: Player
            },
            {
                path: '/about',
                name: 'About',
                component: About
            },
            {
                path: 'search',
                name: 'Search',
                component: Search
            },
            {
                path: '/:pathMatch(.*)*',
                name: 'NotFound',
                component: NotFound
            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router