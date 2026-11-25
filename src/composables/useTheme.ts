/**
 * テーマの状態管理
 */
import { onMounted, onUnmounted, ref } from 'vue'

/** テーマ名 */
export type Theme = 'light' | 'dark'

/**
 * localStorageからテーマを読み取る
 */
export function readTheme(): Theme | null {
  try {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

/**
 * DOMにテーマを適用
 */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

/**
 * テーマの状態管理
 */
export function useTheme() {
  const media = matchMedia('(prefers-color-scheme: dark)')
  const preference = ref(readTheme())
  const theme = ref<Theme>(preference.value ?? (media.matches ? 'dark' : 'light'))

  /**
   * テーマの同期
   */
  function update(value: Theme) {
    theme.value = value; applyTheme(value)
  }

  /**
   * テーマを切り替え
   */
  function toggle() {
    const value = theme.value === 'dark' ? 'light' : 'dark'
    preference.value = value
    update(value)
    try {
      localStorage.setItem('theme', value)
    } catch {
      //何もしない
    }
  }

  /**
   * OSのテーマ変更を反映
   */
  function systemChange(event: MediaQueryListEvent) {
    if (!preference.value)
      update(event.matches ? 'dark' : 'light')
  }

  /**
   * localStorageの書き換え
   */
  function storageChange(event: StorageEvent) {
    if (event.key !== 'theme' && event.key !== null) return
    preference.value = readTheme()
    update(preference.value ?? (media.matches ? 'dark' : 'light'))
  }

  onMounted(() => {
    update(theme.value)
    media.addEventListener('change', systemChange)
    window.addEventListener('storage', storageChange)
  })

  onUnmounted(() => {
    media.removeEventListener('change', systemChange)
    window.removeEventListener('storage', storageChange)
  })

  return { theme, toggle }
}
