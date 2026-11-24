/**
 * 現在色をHSVで管理し、RGB・HEXを算出する状態管理。
 */
import { computed, ref } from 'vue'
import { clamp, hexToRgb, hsvToRgb, normalizeHex, rgbToHex, rgbToHsv } from '@/lib/color'
import type { HSV, RGB } from '@/lib/color'

/**
 * HSVを唯一の更新元とし、形式間の循環更新を防ぐ。
 * @returns 現在色のref・computedと各形式からの更新関数。
 */
export function useColor() {
  const hsv = ref<HSV>({ h: 0, s: 1, v: 1 })
  const rgb = computed(() => hsvToRgb(hsv.value))
  const hex = computed(() => rgbToHex(rgb.value))
  /**
   * HSVの各成分を範囲内に補正して現在色を更新する。
   * @param value 色相0–360、彩度・明度0–1のHSV。
   */
  function setHSV(value: HSV) {
    hsv.value = { h: clamp(value.h, 0, 360), s: clamp(value.s, 0, 1), v: clamp(value.v, 0, 1) }
  }
  /**
   * RGBをHSVへ変換して現在色を更新する。
   * @param value 各成分0–255のRGB。
   */
  function setRGB(value: RGB) { setHSV(rgbToHsv(value)) }
  /**
   * 有効な6桁HEXの場合だけ現在色を更新する。
   * @param value #の有無を問わないHEX文字列。
   * @returns 更新した場合true、不正な形式ならfalse。
   */
  function setHex(value: string): boolean {
    const normalized = normalizeHex(value)
    if (!normalized) return false
    setRGB(hexToRgb(normalized))
    return true
  }
  return { hsv, rgb, hex, setHSV, setRGB, setHex }
}
