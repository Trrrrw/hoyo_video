<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from "vue-router"
import { getItem } from '../utils/menuItemGet'
import { navigateToSpecificType } from '../utils/routerHandlers'

const route = useRoute()
const allTypesWithData = ref(null)
const allTypes = ref([])


const selectedGameOrAbout = computed(() => {
    return route.name === 'About' ? ['about'] :
        route.params.game ? [route.params.game] : []
})
const currentType = ref(route.query.type ? [route.query.type] : [])

const loadTopMenuBarItems = async () => {
    try {
        const allTypesWithDataRe = await import(`../data/${selectedGameOrAbout.value[0]}/types.json`)
        allTypesWithData.value = allTypesWithDataRe.default
        allTypes.value = Object.keys(allTypesWithData.value).map(typeName =>
            getItem(typeName, typeName, null, null, null)
        )
        allTypes.value.unshift(getItem('全部视频', '全部视频', null, null, null))
    } catch (error) {
        console.error("Failed to load data:", error)
    }
}
onMounted(() => {
    loadTopMenuBarItems()
})
watch(
    () => route.query.type,
    (newType) => {
        currentType.value = newType ? [newType] : []
    }
)
</script>

<template>
    <a-menu class="width-100" v-model:openKeys="currentType" v-model:selectedKeys="currentType" mode="horizontal"
        :items="allTypes"
        @click="(clickedType) => { navigateToSpecificType(selectedGameOrAbout[0], clickedType.key) }" />
</template>

<style scoped>
.width-100 {
    width: 100%;
}
</style>
