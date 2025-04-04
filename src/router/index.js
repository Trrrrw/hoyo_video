import { createRouter, createWebHashHistory } from 'vue-router'

import SpecificGame from "../views/SpecificGame.vue"
import SpecificType from "../views/SpecificType.vue"
import VideoPlayback from "../views/VideoPlayback.vue"
import About from '../views/About.vue'
import Home from '../views/Home.vue'

const routes = [
    {
        path: '/',
        component: Home
    },
    // {
    //     path: '/',
    //     redirect: '/原神'
    // },
    {
        path: '/:game/video',
        name: 'VideoPlayback',
        component: VideoPlayback
    },
    {
        path: '/:game',
        name: 'SpecificGame',
        component: SpecificGame,
        beforeEnter: (to, from, next) => {
            if (to.query.type) {
                next({ name: 'SpecificType', params: { game: to.params.game }, query: to.query })
            } else {
                next()
            }
        }
    },
    {
        path: '/:game',
        name: 'SpecificType',
        component: SpecificType,
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    {
        path: '/home',
        name: 'Home',
        component: Home
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router