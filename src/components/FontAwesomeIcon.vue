<script setup lang="ts">
/**
 * Font-AwesomeアイコンのShell
 */

import plus from '@fortawesome/fontawesome-free/svgs/solid/plus.svg?raw'
import copy from '@fortawesome/fontawesome-free/svgs/solid/copy.svg?raw'
import check from '@fortawesome/fontawesome-free/svgs/solid/check.svg?raw'
import xmark from '@fortawesome/fontawesome-free/svgs/solid/xmark.svg?raw'
import sun from '@fortawesome/fontawesome-free/svgs/solid/sun.svg?raw'
import moon from '@fortawesome/fontawesome-free/svgs/solid/moon.svg?raw'

defineProps<{ name: string }>()

const icons: Readonly<Record<string, string>> = {
  'fa-plus': plus, 'fa-copy': copy, 'fa-check': check, 'fa-xmark': xmark,
  'fa-sun': sun, 'fa-moon': moon,
}
</script>

<template>
  <span class="fontawesome-icon" aria-hidden="true" v-html="icons[name]" />
</template>

<style scoped>
.fontawesome-icon {
  display: inline-block;
  width: 1.25em;
  line-height: 1;
  vertical-align: -0.125em;
}

.fontawesome-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 1em;
  fill: currentColor;
}
</style>
