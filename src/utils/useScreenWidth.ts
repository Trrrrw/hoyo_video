import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * 响应式屏幕宽度工具
 * @returns {Ref<number>} 屏幕宽度响应式变量
 */
export const useScreenWidth = (): { screenWidth: Ref<number> } => {
    const screenWidth = ref<number>(0)

    const updateScreenWidth = (): void => {
        screenWidth.value = window.innerWidth
    }

    onMounted((): void => {
        updateScreenWidth()
        window.addEventListener('resize', updateScreenWidth)
    })

    onUnmounted((): void => {
        window.removeEventListener('resize', updateScreenWidth)
    })

    return { screenWidth }
}