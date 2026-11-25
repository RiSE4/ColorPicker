<script setup lang="ts">
/**
 * SV/Hue Canvasの描画
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { clamp } from '@/lib/color'
import type { HSV } from '@/lib/color'

const props = defineProps<{ hsv: HSV; mode: 'sv' | 'hue' }>()
const emit = defineEmits<{ change: [value: HSV]; preview: [value: HSV]; add: [] }>()
const canvas = ref<HTMLCanvasElement | null>(null)
const isSV = computed(() => props.mode === 'sv')

//選択マーカーをhoverのプレビューから切り離す
const selectedSV = ref({ s: props.hsv.s, v: props.hsv.v })
const pointerStyle = computed(() => ({
  left: `${isSV.value ? selectedSV.value.s * 100 : props.hsv.h / 360 * 100}%`,
  top: isSV.value ? `${(1 - selectedSV.value.v) * 100}%` : '50%',
}))

let observer: ResizeObserver | undefined
let resolution: MediaQueryList | undefined
let activePointer: number | null = null

/**
 * CSSサイズとDPRに内部解像度を合わせ、SVまたはHueのグラデーションを再描画
 */
function draw() {
  const element = canvas.value
  const ctx = element?.getContext('2d')
  if (!element || !ctx) return

  const { width, height } = element.getBoundingClientRect()
  if (!width || !height) return

  const dpr = window.devicePixelRatio || 1
  element.width = Math.round(width * dpr)
  element.height = Math.round(height * dpr)
  ctx.setTransform(element.width / width, 0, 0, element.height / height, 0, 0)

  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  if (isSV.value) {
    gradient.addColorStop(0, '#fff')
    gradient.addColorStop(1, `hsl(${props.hsv.h},100%,50%)`)
  } else {
    for (let h = 0; h <= 360; h += 60)
      gradient.addColorStop(h / 360, `hsl(${h},100%,50%)`)
  }
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (isSV.value) {
    const valueGradient = ctx.createLinearGradient(0, 0, 0, height)
    valueGradient.addColorStop(0, 'rgba(0,0,0,0)')
    valueGradient.addColorStop(1, '#000')
    ctx.fillStyle = valueGradient
    ctx.fillRect(0, 0, width, height)
  }
}

/**
 * ポインターの表示座標を正規化してHSVへ変換
 */
function colorAt(event: PointerEvent): HSV | null {
  const rect = canvas.value?.getBoundingClientRect()
  if (!rect?.width || !rect.height) return null

  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1)

  return isSV.value ? { ...props.hsv, s: x, v: 1 - y } : { ...props.hsv, h: x * 360 }
}

/**
 * Canvasの更新
 */
function update(event: PointerEvent) {
  const value = colorAt(event)
  if (!value) return

  if (isSV.value) {
    emit('preview', value)
    if (activePointer === event.pointerId)
      selectedSV.value = { s: value.s, v: value.v }
  } else {
    emit('change', value)
  }
}

/**
 * マウス操作イベント
 */
function move(event: PointerEvent) {
  if (activePointer === event.pointerId || (activePointer === null && isSV.value && event.pointerType === 'mouse'))
    update(event)
}

/**
 * マウスdownイベント
 */
function down(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0 || activePointer !== null) return
  activePointer = event.pointerId
  canvas.value?.focus({ preventScroll: true })
  canvas.value?.setPointerCapture(event.pointerId)
  update(event)
}

/**
 * マウスupイベント
 */
function up(event: PointerEvent) {
  if (activePointer !== event.pointerId)
    return

  update(event)
  activePointer = null

  if (canvas.value?.hasPointerCapture(event.pointerId))
    canvas.value.releasePointerCapture(event.pointerId)

  const rect = canvas.value?.getBoundingClientRect()
  const value = colorAt(event)
  if (isSV.value && value && rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
    emit('change', value)
    emit('add')
  }
}

/**
 * キャンセルイベント
 */
function cancel(event: PointerEvent) {
  if (activePointer === event.pointerId) {
    activePointer = null
    selectedSV.value = { s: props.hsv.s, v: props.hsv.v }
  }
}

/**
 * キーボード操作イベント
 */
function keydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()

    if (isSV.value) {
      emit('change', { ...props.hsv, ...selectedSV.value })
      emit('add')
    }
    return
  }

  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
    return

  event.preventDefault()
  const next = { ...props.hsv }
  const step = event.shiftKey ? 10 : 1

  if (isSV.value) {
    if (event.key === 'ArrowLeft') next.s = clamp(next.s - step / 100, 0, 1)
    if (event.key === 'ArrowRight') next.s = clamp(next.s + step / 100, 0, 1)
    if (event.key === 'ArrowUp') next.v = clamp(next.v + step / 100, 0, 1)
    if (event.key === 'ArrowDown') next.v = clamp(next.v - step / 100, 0, 1)
    if (event.key === 'Home') { next.s = 0; next.v = 1 }
    if (event.key === 'End') { next.s = 1; next.v = 0 }
  } else {
    const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1
    next.h = event.key === 'Home' ? 0 : event.key === 'End' ? 360 : clamp(next.h + direction * step, 0, 360)
  }
  emit('change', next)
}

/**
 * 現在のDPRを監視し、画面移動などによる解像度変更を検出
 */
function watchResolution() {
  resolution?.removeEventListener('change', resolutionChange)
  resolution = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`)
  resolution.addEventListener('change', resolutionChange)
}

/**
 * DPR変更後に再描画し、新しいDPRの監視へ付け替え
 */
function resolutionChange() { draw(); watchResolution() }
onMounted(() => {
  if (canvas.value) {
    observer = new ResizeObserver(draw);
    observer.observe(canvas.value);
  }

  window.addEventListener('resize', draw)
  watchResolution()
  draw()
})

onUnmounted(() => {
  observer?.disconnect()
  resolution?.removeEventListener('change', resolutionChange)
  window.removeEventListener('resize', draw)
})

watch(() => props.hsv.h, draw)
watch(() => [props.hsv.s, props.hsv.v], () => {
  selectedSV.value = {
    s: props.hsv.s,
    v: props.hsv.v
  }
})
</script>

<template>
  <div :id="isSV ? 'canvasWrapper' : 'hueWrapper'" class="canvas-wrap" :class="mode">
    <canvas ref="canvas" :id="isSV ? 'svCanvas' : 'hueCanvas'" tabindex="0" :role="isSV ? 'group' : 'slider'"
      :aria-label="isSV ? '彩度と明度（矢印キーで調整、Enterで追加）' : '色相'" :aria-valuemin="isSV ? undefined : 0"
      :aria-valuemax="isSV ? undefined : 360" :aria-valuenow="isSV ? undefined : Math.round(hsv.h)"
      :aria-valuetext="isSV ? undefined : `${Math.round(hsv.h)}度`" @pointerdown.prevent="down" @pointermove="move"
      @pointerup="up" @pointercancel="cancel" @lostpointercapture="cancel" @keydown="keydown" />

    <span :id="isSV ? 'canvasPointer' : 'hueIndicator'" class="indicator" :class="{ 'circle-pointer': isSV }"
      :style="pointerStyle" aria-hidden="true" />
  </div>
</template>

<style scoped>
.canvas-wrap {
  position: relative;
  width: 100%;
}

canvas {
  display: block;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 12px #0003;
  touch-action: none;
  cursor: pointer;
}

.sv canvas {
  aspect-ratio: 7 / 4;
}

.hue canvas {
  height: 30px;
}

.indicator {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.sv .indicator {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #222;
}

.hue .indicator {
  width: 3px;
  height: 34px;
  border: 1px solid white;
  background: #222;
}
</style>
