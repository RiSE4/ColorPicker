/**
 * Vue単一画面アプリのビルド設定。GitHub Pagesの公開パスとTypeScriptのaliasを一致させる。
 */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/ColorPicker/',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
