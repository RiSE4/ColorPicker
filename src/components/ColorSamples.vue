<script setup lang="ts">
/**
 * カラーサンプルのボタン
 */
defineEmits<{ generate: [hue: number] }>()
const hues = Array.from({ length: 12 }, (_, i) => i * 30)
</script>

<template>
  <div id="rainbowButtons" aria-label="色相からランダムな色を生成">
    <button v-for="hue in hues" :key="hue" :style="{ backgroundColor: `hsl(${hue},100%,50%)` }"
      :aria-label="`色相${hue}度の色を生成`" :title="`色相${hue}°`" @click="$emit('generate', hue)" />
  </div>
</template>

<style scoped>
#rainbowButtons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-block: 16px;
}

button {
  border: 1px solid #0003;
  min-height: 36px;
  box-shadow: 0 2px 6px #0003;
}
</style>
