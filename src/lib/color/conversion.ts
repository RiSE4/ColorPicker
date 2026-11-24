/**
 * ブラウザやVueに依存しないHEX・RGB・HSV変換。出力RGBは整数へ丸める。
 */
import type { HSV, RGB } from './types'

/**
 * 有限値を指定範囲に制限する。
 * @param value 補正対象。
 * @param min 下限。
 * @param max 上限。
 * @returns 範囲内の数値。
 * @throws RangeError 非有限値が指定された場合。
 */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) throw new RangeError('有限の数値を指定してください')
  return Math.min(max, Math.max(min, value))
}

/**
 * 6桁HEXを検証し、#付きの大文字表記へ正規化する。
 * @param value 検証する値。前後の空白と#の省略を許容する。
 * @returns 正規化したHEX。不正値ならnull。
 */
export function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const hex = value.trim().replace(/^#/, '')
  return /^[\da-f]{6}$/i.test(hex) ? `#${hex.toUpperCase()}` : null
}

/**
 * 6桁HEXをRGBへ変換する。
 * @param hex #付きまたは#なしのHEX。
 * @returns 各成分0–255のRGB。
 * @throws RangeError HEX形式が不正な場合。
 */
export function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex)
  if (!normalized) throw new RangeError('6桁のHEXを指定してください')
  const value = Number.parseInt(normalized.slice(1), 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

/**
 * RGBを範囲補正・四捨五入してHEXへ変換する。
 * @param param0 各成分0–255のRGB。
 * @returns #付き大文字6桁HEX。
 */
export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase()
}

/**
 * mainと同じ計算式でHSVをRGBへ変換する。
 * @param param0 hは0–360、s/vは0–1。
 * @returns 各成分を0–255の整数に丸めたRGB。
 */
export function hsvToRgb({ h, s, v }: HSV): RGB {
  h = clamp(h, 0, 360); s = clamp(s, 0, 1); v = clamp(v, 0, 1)
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) }
}

/**
 * RGBをHSVへ変換する。無彩色の色相は0とする。
 * @param param0 各成分0–255のRGB。
 * @returns hは0–360、s/vは0–1のHSV。
 */
export function rgbToHsv({ r, g, b }: RGB): HSV {
  r = clamp(r, 0, 255) / 255; g = clamp(g, 0, 255) / 255; b = clamp(b, 0, 255) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  let h = 0
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h *= 60
  }
  return { h, s: max === 0 ? 0 : d / max, v: max }
}
