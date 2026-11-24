/**
 * 保存テーマまたはOS設定を初期描画前に適用し、Vueアプリケーションを起動する。
 */
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import { applyTheme, readTheme } from './composables/useTheme'

applyTheme(readTheme() ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
createApp(App).mount('#app')
