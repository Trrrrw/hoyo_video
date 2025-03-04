import {createRouter, createWebHistory} from 'vue-router'

import SpecificGame from "../views/SpecificGame.vue"
import SpecificType from "../views/SpecificType.vue"
import VideoPlayback from "../views/VideoPlayback.vue"

const routes = [
    {
        path: '/',
        redirect: '/原神'
    },
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
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router