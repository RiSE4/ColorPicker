<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useColor } from '@/composables/useColor'

const svCanvas = ref(null)
const hueCanvas = ref(null)

const { hue, s, v, hex, setHue, setSV, setHex } = useColor()

function resizeCanvas(canvas) {
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const ctx = canvas.getContext('2d')

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)
}

function drawHue() {
  const canvas = hueCanvas.value
  const ctx = canvas.getContext('2d')
  const w = canvas.getBoundingClientRect().width
  const h = canvas.getBoundingClientRect().height

  const g = ctx.createLinearGradient(0, 0, w, 0)
  for (let i = 0; i <= 360; i += 60) {
    g.addColorStop(i / 360, `hsl(${i},100%,50%)`)
  }

  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawSV() {
  const canvas = svCanvas.value
  const ctx = canvas.getContext('2d')
  const w = canvas.getBoundingClientRect().width
  const h = canvas.getBoundingClientRect().height

  const g1 = ctx.createLinearGradient(0, 0, w, 0)
  g1.addColorStop(0, '#fff')
  g1.addColorStop(1, `hsl(${hue.value},100%,50%)`)
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, w, h)

  const g2 = ctx.createLinearGradient(0, 0, 0, h)
  g2.addColorStop(0, 'rgba(0,0,0,0)')
  g2.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, w, h)
}

function getPoint(e) {
  if (e.touches && e.touches.length) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  return { x: e.clientX, y: e.clientY }
}

function updateSV(e) {
  const { x, y } = getPoint(e)
  const rect = svCanvas.value.getBoundingClientRect()
  const px = Math.min(Math.max(x - rect.left, 0), rect.width)
  const py = Math.min(Math.max(y - rect.top, 0), rect.height)
  setSV(px / rect.width, 1 - py / rect.height)
}

function updateHue(e) {
  const { x } = getPoint(e)
  const rect = hueCanvas.value.getBoundingClientRect()
  const px = Math.min(Math.max(x - rect.left, 0), rect.width)
  setHue((px / rect.width) * 360)
}

let dragSV = false
let dragHue = false

onMounted(async () => {
  await nextTick()

  resizeCanvas(svCanvas.value)
  resizeCanvas(hueCanvas.value)

  drawHue()
  drawSV()

  setHex('#3b82f6')

  window.addEventListener('resize', () => {
    resizeCanvas(svCanvas.value)
    resizeCanvas(hueCanvas.value)
    drawHue()
    drawSV()
  })
})

watch(hue, () => {
  drawSV()
})
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6 p-4">
    <div class="flex flex-col">
      <canvas
        ref="svCanvas"
        class="w-[300px] h-[200px] rounded shadow cursor-crosshair bg-white dark:bg-gray-700"
        @mousedown="dragSV = true; updateSV($event)"
        @mousemove="dragSV && updateSV($event)"
        @mouseup="dragSV = false"
        @mouseleave="dragSV = false"
        @touchstart.prevent="dragSV = true; updateSV($event)"
        @touchmove.prevent="dragSV && updateSV($event)"
        @touchend="dragSV = false"
      />
      <canvas
        ref="hueCanvas"
        class="w-[300px] h-[30px] mt-4 rounded shadow cursor-pointer bg-white dark:bg-gray-700"
        @mousedown="dragHue = true; updateHue($event)"
        @mousemove="dragHue && updateHue($event)"
        @mouseup="dragHue = false"
        @mouseleave="dragHue = false"
        @touchstart.prevent="dragHue = true; updateHue($event)"
        @touchmove.prevent="dragHue && updateHue($event)"
        @touchend="dragHue = false"
      />
    </div>

    <div class="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div class="w-16 h-16 rounded border" :style="{ background: hex }" />
      <p class="mt-2 font-mono text-lg text-gray-800 dark:text-gray-100">
        {{ hex }}
      </p>
    </div>
  </div>
</template>