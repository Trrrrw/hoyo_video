import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * 深色模式检测工具
 * @returns {Ref<boolean>} 是否为深色模式响应式变量
 */
export const useDarkTheme = (): { isDark: Ref<boolean> } => {
    const isDark: Ref<boolean> = ref(false)

    const updateDarkMode = () => {
        isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    onMounted(() => {
        updateDarkMode()
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateDarkMode)
    })
    onUnmounted(() => {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateDarkMode)
    })
    return { isDark }
}