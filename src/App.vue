<script setup lang="ts">
/**
 * 画面全体の操作を現在色・パレット・テーマへ接続する。ホバーのプレビューと確定色を分離する。
 */
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import { computed, ref, watch } from 'vue'
import ColorCanvas from '@/components/ColorCanvas.vue'
import ColorInputs from '@/components/ColorInputs.vue'
import ColorSamples from '@/components/ColorSamples.vue'
import ColorPalette from '@/components/ColorPalette.vue'
import PaletteControls from '@/components/PaletteControls.vue'
import { useColor } from '@/composables/useColor'
import { usePalette } from '@/composables/usePalette'
import { useTheme } from '@/composables/useTheme'
import { useEyeDropper } from '@/composables/useEyeDropper'
import { useFeedback } from '@/composables/useFeedback'
import { generateUniqueColors, hsvToRgb, rgbToHex } from '@/lib/color'
import type { HSV } from '@/lib/color'

const { hsv, rgb, hex, setHSV, setRGB, setHex } = useColor()
const palette = usePalette()
const { colors } = palette
const { theme, toggle } = useTheme()
const { active, pick } = useEyeDropper()
const { feedback, animate, copy } = useFeedback()

/**


 * 本番と同じく、SVホバーはHEX/プレビューだけを変更する。


 */
/**

 * RGB/HSV入力と丸い選択マーカーはクリック確定まで保持する。

 */
const preview = ref<HSV | null>(null)
const canvasHue = ref(hsv.value.h)
const canvasHSV = computed(() => ({ ...hsv.value, h: canvasHue.value }))
const previewHex = computed(() => preview.value ? rgbToHex(hsvToRgb(preview.value)) : hex.value)
watch(hsv, value => { preview.value = null; canvasHue.value = value.h }, { flush: 'sync' })
/**
 * Canvasの色相だけを変更し、SVを選択するまで確定色の入力値を維持する。
 * @param value 新しい色相を含むHSV。
 */
function changeHue(value: HSV) { canvasHue.value = value.h }

/**
 * 指定色をパレットへ追加し、入力ボタンの場合は結果を演出する。
 * @param value 追加するHEX。省略時は現在の確定色。
 * @param key 省略時はボタン演出を行わない。
 */
function addColor(value = hex.value, key?: string) {
  if (key) setHex(value)
  const added = palette.add(value)
  if (key) animate(key, !added)
}
/**
 * パレットの色を確定色へ反映し、HEXをコピーする。
 * @param value 選択したHEX。
 */
function selectColor(value: string) { setHex(value); void copy(value, `palette-${value}`) }
/**
 * 指定色相の候補をパレットに追加し、最後の候補を現在色へ反映する。
 * @param hue 生成元の色相0–360。
 */
function generate(hue: number) {
  const generated = generateUniqueColors(hue)
  const last = generated.at(-1)
  if (last) setHSV(last)
  palette.addMany(generated.map(value => rgbToHex(hsvToRgb(value))))
}
/**
 * 本番と同じ確認ダイアログで承認された場合だけ全色を削除する。
 */
function clear() {
  /**

   * 操作後の通知は廃止するが、本番にある全削除前の確認は維持する。

   */
  if (window.confirm('本当にすべての色を削除しますか？')) palette.clear()
}
/**
 * スポイトの取得成功時だけ現在色を更新し、パレットへ追加する。
 * @returns 取得処理の完了を表すPromise。
 */
async function eyeDropper() {
  const result = await pick()
  if (result.status === 'success') { setHex(result.hex); addColor(result.hex) }
}
</script>

<template>
  <header>
    <h1><img class="app-icon" src="/favicon.ico" alt="" width="36" height="36">Color Picker</h1>
    <button class="theme-toggle" :class="{ 'is-dark': theme === 'dark' }" role="switch" :aria-checked="theme === 'dark'" aria-label="ダークモード" @click="toggle">
      <span class="theme-thumb" aria-hidden="true" />
      <FontAwesomeIcon class="theme-sun" name="fa-sun" />
      <FontAwesomeIcon class="theme-moon" name="fa-moon" />
    </button>
  </header>
  <main>
    <div class="app-wrap">
      <div class="left-area">
        <ColorCanvas mode="sv" :hsv="canvasHSV" @preview="preview = $event" @change="setHSV" @add="addColor()" />
        <ColorCanvas mode="hue" :hsv="canvasHSV" @change="changeHue" />
      </div>
      <div class="right-area">
        <ColorInputs :hex="previewHex" :rgb="rgb" :hsv="hsv" :feedback="feedback"
          @hex="setHex" @rgb="setRGB" @hsv="setHSV" @add="addColor" @copy="copy"
          @invalid="animate($event, true)" />
        <ColorSamples @generate="generate" />
        <PaletteControls :picking="active" @merge="palette.merge" @pick="eyeDropper" @sort="palette.sort" @clear="clear" />
      </div>
    </div>
    <ColorPalette :colors="colors" :feedback="feedback" @select="selectColor" @remove="palette.remove" />
  </main>
  <footer>Copyright (C) 2025 RiSE4. Reference at GitHub repository <a href="https://github.com/RiSE4/ColorPicker" target="_blank" rel="noopener noreferrer">here</a>.</footer>
</template>

<style scoped>
header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
h1 { display: flex; align-items: center; gap: 12px; margin: 0; font-size: 32px; }
.app-icon { display: block; flex: none; width: 36px; height: 36px; object-fit: contain; }
.theme-toggle { position: relative; display: grid; grid-template-columns: repeat(2, 36px); place-items: center; width: 82px; height: 44px; padding: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 24px; color: var(--muted); }
.theme-toggle:hover { filter: none; }
.theme-thumb { position: absolute; top: 4px; left: 4px; width: 36px; height: 34px; border-radius: 50%; background: #f2d28b; box-shadow: 0 1px 4px #0002; transform: translateX(0); transition: transform 0.25s ease; }
.theme-toggle.is-dark .theme-thumb { transform: translateX(36px); background: #536482; }
.theme-sun, .theme-moon { position: relative; z-index: 1; font-size: 18px; pointer-events: none; }
.theme-sun { color: #865400; }
.is-dark .theme-sun { color: var(--muted); }
.is-dark .theme-moon { color: #fff; }
@media (prefers-reduced-motion: reduce) { .theme-thumb { transition: none; } }
.app-wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(480px, 1fr); gap: 24px; align-items: start; }
.left-area { display: grid; gap: 20px; min-width: 0; }
.right-area { background: var(--surface); padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px #0001; min-width: 0; }
footer { background: #282828; color: white; text-align: center; padding: 12px; font-size: 13px; margin-top: auto; }
footer a { color: skyblue; }
@media (max-width: 1023px) { .app-wrap { grid-template-columns: minmax(0, 1fr); } }
</style>


