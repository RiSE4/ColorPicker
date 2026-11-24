<script setup lang="ts">
/**
 * HEX配列を表示し、選択・削除イベントを通知する。コピー成功状態で枠と上方ラベルを1秒間表示する。
 */
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import type { Feedback } from '@/composables/useFeedback'
defineProps<{ colors: readonly string[]; feedback: Feedback }>()
defineEmits<{ select: [hex: string]; remove: [hex: string] }>()
</script>

<template>
  <section id="palette" aria-label="カラーパレット">
    <article v-for="hex in colors" :key="hex" class="color-box"
      :class="{ copied: feedback[`palette-${hex}`] && !feedback[`palette-${hex}`]?.error }">
      <button class="color-sample" :style="{ backgroundColor: hex }" :aria-label="`${hex}を選択してコピー`"
        @click="$emit('select', hex)" />
      <span class="hex-label">{{ hex }}</span>
      <button class="delete-btn" :aria-label="`${hex}を削除`" @click="$emit('remove', hex)">
        <FontAwesomeIcon name="fa-xmark" />
      </button>
      <span class="copied-label" aria-hidden="true">コピーしました</span>
    </article>
  </section>
</template>

<style scoped>
#palette {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

/* テーマの背景色・境界色は即時反映し、コピー時の影だけアニメーションする。 */
.color-box {
  width: 100px;
  height: 100px;
  padding: 10px;
  border: 2px solid var(--border);
  background: var(--surface);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: box-shadow 0.5s;
}

.color-sample {
  width: 100%;
  min-height: 52px;
  border: 1px solid #888;
  border-radius: 0;
}

.hex-label {
  font-size: 14px;
}

.delete-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  min-height: 20px;
  width: 20px;
  padding: 0;
  border-radius: 50%;
  background: var(--error);
  color: white;
  font-size: 12px;
}

.copied {
  border-color: #2ecc71;
  box-shadow: 0 0 10px #2ecc71;
  background-color: var(--palette-copied-background);
  color: var(--palette-copied-text);
}

/* 本番と同じくコピー成功時の1秒間だけ、上方へ浮かぶラベルを表示する。 */
.copied-label {
  position: absolute;
  top: -20px;
  background: rgb(0 0 0 / 70%);
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
  opacity: 0;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  white-space: nowrap;
}

.color-box.copied .copied-label {
  opacity: 1;
  transform: translateY(-5px);
}

@media (pointer: coarse) {
  .delete-btn {
    min-height: 36px;
    width: 36px;
  }
}
</style>
