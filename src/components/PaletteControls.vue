<script setup lang="ts">
/**
 * しきい値入力と4つの操作ボタン。merge・pick・sort・clearを親へ通知し、picking中はスポイトを無効化する。
 */
import { ref } from 'vue'
defineProps<{ picking: boolean }>()
defineEmits<{ merge: [threshold: number]; pick: []; sort: []; clear: [] }>()
const threshold = ref<number | string>(7)
</script>

<template>
  <div class="palette-controls">
    <div class="merge-row">
      <label for="threshold">しきい値 (ΔE):</label>
      <input id="threshold" v-model="threshold" type="number" min="1" step="any" aria-label="しきい値 (ΔE)">
    </div>
    <div class="button-row">
      <button id="killPaletteBtn" @click="$emit('merge', Number(threshold))">🔎近い色を結合</button>
      <button id="dropperBtn" :disabled="picking" @click="$emit('pick')">🎯スポイト</button>
      <button id="sortPaletteLabBtn" @click="$emit('sort')">🎨パレットを並び替え</button>
      <button id="clearPaletteBtn" @click="$emit('clear')">🧹パレットをクリア</button>
    </div>
  </div>
</template>

<style scoped>
.palette-controls {
  display: grid;
  gap: 10px;
  container-type: inline-size;
}

.button-row {
  display: flex;
  gap: 4px;
}

.merge-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

label {
  font-size: 14px;
}

input {
  width: 68px;
  padding: 6px;
}

button {
  flex: 1 0 auto;
  background: var(--green);
  color: white;
  padding: 8px 4px;
  font-size: clamp(9px, 2.7cqi, 15px);
  white-space: nowrap;
}
</style>
