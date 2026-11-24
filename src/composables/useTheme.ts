/**
 * ユーザーの保存設定を優先し、未選択時はOSのテーマ変更に追従する。
 */
import { onMounted, onUnmounted, ref } from 'vue'

/** 保存値とルート要素のdata-theme属性で共通利用するテーマ名。 */
export type Theme = 'light' | 'dark'
/**
 * localStorageから有効なテーマだけを読み取る。
 * @returns lightまたはdark。未設定・不正値・読取拒否時はnull。
 */
export function readTheme(): Theme | null {
  try {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch { return null }
}
/**
 * CSS変数のテーマを切り替える。色計算やパレットの値は変更しない。
 * @param theme ルート要素へ適用するテーマ。
 */
export function applyTheme(theme: Theme) { document.documentElement.dataset.theme = theme }

/**
 * テーマの選択・永続化とOS/別タブの変更監視を提供する。監視はアンマウント時に解除する。
 * @returns 現在のテーマと切り替え関数。
 */
export function useTheme() {
  const media = matchMedia('(prefers-color-scheme: dark)')
  const preference = ref(readTheme())
  const theme = ref<Theme>(preference.value ?? (media.matches ? 'dark' : 'light'))
  /**
   * Vueの状態とルート要素のテーマを同期する。
   * @param value 適用するテーマ。
   */
  function update(value: Theme) { theme.value = value; applyTheme(value) }
  /**
   * ライト・ダークを反転し、明示的なユーザー設定として保存する。
   */
  function toggle() {
    const value = theme.value === 'dark' ? 'light' : 'dark'
    preference.value = value
    update(value)
    try { localStorage.setItem('theme', value) }
    catch { /* 保存を拒否されても、現在の画面には選択テーマを適用する。 */ }
  }
  /**
   * ユーザー設定がない場合だけOSの変更を反映する。
   * @param event OSの配色設定変更。
   */
  function systemChange(event: MediaQueryListEvent) {
    if (!preference.value) update(event.matches ? 'dark' : 'light')
  }
  /**
   * 別タブでの設定変更または保存領域の全消去を反映する。
   * @param event localStorageの変更イベント。
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
