/**
 * 色差による結合・整列とHSV距離によるランダム生成。入力配列を書き換えない。
 */
import type { HSV } from './types'
import { hexToRgb, clamp } from './conversion'
import { deltaE, rgbToLab } from './lab'

/**
 * 先に保持した色との色差がしきい値未満の色を除く。除去した色を比較元にしない。
 * @param colors 元の順序のHEX配列。
 * @param threshold 1未満や非有限値の場合は7を使用する。
 * @returns 保持した順序の新しいHEX配列。
 */
export function mergeSimilarColors(colors: readonly string[], threshold = 7): string[] {
  const limit = Number.isFinite(threshold) && threshold >= 1 ? threshold : 7
  const kept: { hex: string; lab: ReturnType<typeof rgbToLab> }[] = []
  for (const hex of colors) {
    const lab = rgbToLab(hexToRgb(hex))
    if (!kept.some(color => deltaE(color.lab, lab) < limit)) kept.push({ hex, lab })
  }
  return kept.map(color => color.hex)
}

/**
 * 先頭色からLAB最近傍を順次選ぶ。同距離では元の順序を優先する。
 * @param colors 並び替えるHEX配列。
 * @returns 最近傍順の新しい配列。空配列にも対応する。
 */
export function sortPaletteByLab(colors: readonly string[]): string[] {
  const remaining = colors.map(hex => ({ hex, lab: rgbToLab(hexToRgb(hex)) }))
  let current = remaining.shift()
  if (!current) return []
  const result = [current.hex]
  while (remaining.length) {
    const currentLab = current.lab
    let index = 0, distance = Infinity
    remaining.forEach((candidate, i) => {
      const d = deltaE(currentLab, candidate.lab)
      if (d < distance) { distance = d; index = i }
    })
    const next = remaining.splice(index, 1)[0]
    if (!next) break
    current = next
    result.push(current.hex)
  }
  return result
}

/**
 * 色相の循環を考慮し、H=2・S=1・V=1.5の重みでHSV距離を求める。
 * @param a 比較元のHSV。
 * @param b 比較先のHSV。
 * @returns 重み付き距離。
 */
export function colorDistanceHSV(a: HSV, b: HSV): number {
  const hueDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180
  return Math.sqrt(2 * hueDiff ** 2 + (a.s - b.s) ** 2 + 1.5 * (a.v - b.v) ** 2)
}

/**
 * 指定色相で彩度0.5–1・明度0.7–1の候補を生成する。試行回数は最大20×count。
 * @param hue 色相0–360。
 * @param count 目標色数。既定値5。
 * @param minDistance 採用済みの色から必要なHSV距離。既定値0.2。
 * @param random 0以上1未満の値を返す乱数源。
 * @returns HSV配列。距離条件により目標色数未満になる場合がある。
 */
export function generateUniqueColors(hue: number, count = 5, minDistance = 0.2, random: () => number = Math.random): HSV[] {
  const results: HSV[] = []
  const h = clamp(hue, 0, 360)
  for (let attempts = 0; results.length < count && attempts < 20 * count; attempts++) {
    const color = { h, s: random() * 0.5 + 0.5, v: random() * 0.3 + 0.7 }
    if (!results.some(existing => colorDistanceHSV(color, existing) < minDistance)) results.push(color)
  }
  return results
}
