<template>
    <div class="p-4">
        <button @click="toggle" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
            {{ isDark ? 'ライトモードにする' : 'ダークモードにする' }}
        </button>

        <p class="mt-4 text-green-800 dark:text-green-300">
            ダークモード切り替えのテストテキストです。
        </p>

        <p class="mt-4 dark:bg-green-500 bg-blue-500">
            テスト
        </p>
    </div>
</template>

<script setup>
import { useDarkMode } from '../composables/useDarkMode'
const { isDark, toggle } = useDarkMode()
</script>
