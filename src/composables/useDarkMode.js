// src/composables/useDarkMode.js
import { ref, onMounted } from 'vue'

export function useDarkMode() {
    const isDark = ref(false)

    const applyTheme = (val) => {
        document.documentElement.classList.toggle('dark', val)
    }

    const toggle = () => {
        isDark.value = !isDark.value
        applyTheme(isDark.value)
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }

    onMounted(() => {
        const saved = localStorage.getItem('theme')
        isDark.value = saved === 'dark'
        applyTheme(isDark.value)
    })

    return { isDark, toggle }
}
