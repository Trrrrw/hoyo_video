<script setup>
import Card from "../components/Card.vue"
import { useRouter } from "vue-router"

const router = useRouter()
const game = "原神"
const handleCardClick = (itemId) => {
  router.push({ path: '/video', query: { game: game, id: itemId } })
}
</script>

<template>
  <Card
    cover="https://fastcdn.mihoyo.com/content-v2/hk4e/154389/cd89294cd24ee09dbdd6f9eddabd70d0_867461851276253893.png"
    type-name="《原神》剧情PV-「浮梦之诉」" description="跨越尘世的探索之旅" @click="handleCardClick(`154389`)" />
</template>

<style scoped>
Card {
  width: 100%;
  box-sizing: border-box;
}
</style>