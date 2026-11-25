<script setup lang="ts">
/**
 * 追加・コピーボタン
 */

import type { FeedbackState } from '@/composables/useFeedback'
import FontAwesomeIcon from './FontAwesomeIcon.vue'
defineProps<{ icon: string; feedback?: FeedbackState }>()
</script>

<template>
  <button class="feedback-button"
    :class="{ 'copied-feedback': feedback && !feedback.error, 'error-feedback': feedback?.error }">
    <FontAwesomeIcon :name="feedback ? (feedback.error ? 'fa-xmark' : 'fa-check') : icon"
      :class="{ 'fade-out': feedback?.fading }" />
  </button>
</template>

<style scoped>
.feedback-button {
  width: 40px;
  padding: 4px;
  font-size: 16px;
  color: white;
  background-color: #3498db;
  transition: background-color 0.3s, box-shadow 0.6s;
  position: relative;
}

.feedback-button:hover {
  background-color: #217dbb;
  filter: none;
}

.feedback-button.copied-feedback {
  background-color: #2ecc71;
  box-shadow: 0 0 0 4px rgb(46 204 113 / 50%);
}

.feedback-button.error-feedback {
  background-color: #e74c3c;
  box-shadow: 0 0 0 4px rgb(231 76 60 / 50%);
}

.fontawesome-icon {
  transition: opacity 0.4s, transform 0.4s;
}

.fade-out {
  opacity: 0;
  transform: scale(0.8);
}
</style>
