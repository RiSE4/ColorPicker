<script setup lang="ts">
/**
 * HEX・RGB・HSVの入力と検証を担当する。propsの表示値と入力途中のdraftを分け、有効な入力だけ親へ通知する。
 */
import { computed, reactive, watch } from 'vue'
import { clamp, hexToRgb, hsvToRgb, normalizeHex, rgbToHex } from '@/lib/color'
import type { HSV, RGB } from '@/lib/color'
import type { Feedback } from '@/composables/useFeedback'
import FeedbackButton from './FeedbackButton.vue'

const props = defineProps<{ hex: string; rgb: RGB; hsv: HSV; feedback: Feedback }>()
const emit = defineEmits<{
  hex: [value: string]; rgb: [value: RGB]; hsv: [value: HSV]
  add: [hex: string, key: string]; copy: [text: string, key: string]; invalid: [key: string]
}>()
type Format = 'hex' | 'rgb' | 'hsv'
const draft = reactive<{ hex: string } & Record<'r' | 'g' | 'b' | 'h' | 's' | 'v', string | number>>({ hex: '', r: '', g: '', b: '', h: '', s: '', v: '' })
const rows = [
  { format: 'rgb', fields: [{ key: 'r', label: 'R', max: 255 }, { key: 'g', label: 'G', max: 255 }, { key: 'b', label: 'B', max: 255 }] },
  { format: 'hsv', fields: [{ key: 'h', label: 'H', max: 360 }, { key: 's', label: 'S', max: 100 }, { key: 'v', label: 'V', max: 100 }] },
] as const
/**
 * 親からの色を入力欄へ同期する。HSVの表示は整数へ丸めるが、計算元の値は変更しない。
 */
function sync() {
  Object.assign(draft, {
    hex: props.hex.slice(1), r: String(props.rgb.r), g: String(props.rgb.g), b: String(props.rgb.b),
    h: String(Math.round(props.hsv.h)), s: String(Math.round(props.hsv.s * 100)), v: String(Math.round(props.hsv.v * 100)),
  })
}
watch(() => [props.hex, props.hsv.h, props.hsv.s, props.hsv.v], sync, { immediate: true })
/**
 * RGB入力の空欄・非有限値を検証し、範囲を補正する。
 * @returns 整数RGB。不正または入力途中の場合null。
 */
function readRGB(): RGB | null {
  if ([draft.r, draft.g, draft.b].some(value => String(value).trim() === '' || !Number.isFinite(Number(value)))) return null
  return { r: Math.round(clamp(Number(draft.r), 0, 255)), g: Math.round(clamp(Number(draft.g), 0, 255)), b: Math.round(clamp(Number(draft.b), 0, 255)) }
}
/**
 * HSV入力の空欄・非有限値を検証し、百分率を0–1へ変換する。
 * @returns 補正済みHSV。不正または入力途中の場合null。
 */
function readHSV(): HSV | null {
  if ([draft.h, draft.s, draft.v].some(value => String(value).trim() === '' || !Number.isFinite(Number(value)))) return null
  return { h: clamp(Number(draft.h), 0, 360), s: clamp(Number(draft.s), 0, 100) / 100, v: clamp(Number(draft.v), 0, 100) / 100 }
}
const valid = computed(() => ({ hex: !!normalizeHex(draft.hex), rgb: !!readRGB(), hsv: !!readHSV() }))
/**
 * 有効な入力だけ対応形式の更新イベントとして親へ通知する。
 * @param format 操作された入力形式。
 */
function input(format: Format) {
  if (format === 'hex') {
    const hex = normalizeHex(draft.hex)
    if (hex) emit('hex', hex)
  } else if (format === 'rgb') {
    const rgb = readRGB()
    if (rgb) {
      Object.assign(draft, { r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) })
      emit('rgb', rgb)
    }
  } else {
    const hsv = readHSV()
    if (hsv) {
      Object.assign(draft, { h: String(hsv.h), s: String(hsv.s * 100), v: String(hsv.v * 100) })
      emit('hsv', hsv)
    }
  }
}
/**
 * 入力を検証し、追加または形式別文字列のコピーを親へ要求する。
 * @param format 対象の入力形式。
 * @param type addは追加、copyはコピー。
 */
function action(format: Format, type: 'add' | 'copy') {
  const key = `${type}-${format}`
  if (!valid.value[format]) { emit('invalid', key); return }
  const rgb = format === 'hex' ? hexToRgb(draft.hex) : format === 'rgb' ? readRGB() : hsvToRgb(readHSV() ?? props.hsv)
  if (!rgb) return
  const hex = rgbToHex(rgb)
  if (type === 'add') emit('add', hex, key)
  else {
    const text = format === 'hex' ? hex : format === 'rgb' ? `rgb(${draft.r}, ${draft.g}, ${draft.b})` : `hsv(${draft.h}, ${draft.s}, ${draft.v})`
    emit('copy', text, key)
  }
}
</script>

<template>
  <div class="color-inputs">
    <div class="picked-color">
      <div id="colorPreview" class="preview" :style="{ backgroundColor: hex }" :aria-label="`現在の色 ${hex}`" />
      <label class="hex-prefix" for="hexInput">#</label>
      <input id="hexInput" v-model="draft.hex" aria-label="HEX" maxlength="7" spellcheck="false"
        :aria-invalid="!valid.hex" @input="input('hex')">
      <FeedbackButton id="addHexBtn" icon="fa-plus" :feedback="feedback['add-hex']" aria-label="HEXをパレットに追加"
        @click="action('hex', 'add')" />
      <FeedbackButton id="copyHexBtn" icon="fa-copy" :feedback="feedback['copy-hex']" aria-label="HEXをコピー"
        @click="action('hex', 'copy')" />
    </div>
    <div v-for="row in rows" :key="row.format" class="input-block">
      <span class="format-label">{{ row.format.toUpperCase() }}:</span>
      <div class="input-row">
        <label v-for="field in row.fields" :key="field.key">
          <span>{{ field.label }}</span>
          <input :id="`${field.key}Input`" v-model="draft[field.key]" type="number" min="0" :max="field.max"
            :step="row.format === 'rgb' ? 1 : 'any'" :aria-label="field.label" :aria-invalid="!valid[row.format]"
            @input="input(row.format)">
        </label>
        <FeedbackButton :id="row.format === 'rgb' ? 'addRgbBtn' : 'addHsvBtn'" icon="fa-plus"
          :feedback="feedback[`add-${row.format}`]" :aria-label="`${row.format.toUpperCase()}をパレットに追加`"
          @click="action(row.format, 'add')" />
        <FeedbackButton :id="row.format === 'rgb' ? 'copyRgbBtn' : 'copyHsvBtn'" icon="fa-copy"
          :feedback="feedback[`copy-${row.format}`]" :aria-label="`${row.format.toUpperCase()}をコピー`"
          @click="action(row.format, 'copy')" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-inputs {
  display: grid;
  gap: 16px;
}

.picked-color {
  display: grid;
  grid-template-columns: 42px 12px minmax(0, 1fr) 40px 40px;
  align-items: center;
  gap: 8px;
}

.preview {
  width: 42px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 4px;
}

.hex-prefix {
  font-size: 24px;
}

.format-label {
  display: block;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 6px;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) 40px 40px;
  align-items: end;
  gap: 8px;
}

.input-row label {
  min-width: 0;
}

.input-row label span {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
  color: var(--muted);
}

input {
  width: 100%;
  min-width: 0;
  text-align: center;
  padding: 8px 3px;
  font-size: 16px;
}

input[aria-invalid="true"] {
  border-color: var(--error);
}
</style>
