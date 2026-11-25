/**
 * パレットの操作（色の結合とランダム生成）
 */
import type { HSV } from './types'
import { hexToRgb, clamp } from './conversion'
import { deltaE, rgbToLab } from './lab'

/**
 * 色差のしきい値もとに色を結合
 * @param colors 元の順序のHEX
 * @param threshold しきい値
 * @returns 新しい順序のHEX
 */
export function mergeSimilarColors(colors: readonly string[], threshold = 7): string[] {
  const limit = Number.isFinite(threshold) && threshold >= 1 ? threshold : 7
  const kept: { hex: string; lab: ReturnType<typeof rgbToLab> }[] = []

  for (const hex of colors) {
    const lab = rgbToLab(hexToRgb(hex))

    if (!kept.some(color => deltaE(color.lab, lab) < limit))
      kept.push({ hex, lab })
  }
  return kept.map(color => color.hex)
}

/**
 * パレットをLabで並び替え
 * @param colors 元の順番のHEX
 * @returns 新しい順番のHEX
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
 * ランダムなパレットの候補を生成（彩度0.5–1・明度0.7–1の範囲を候補）
 * @param hue 色相 0–360
 * @param count 生成する個数（既定値 5）
 * @param minDistance 採用済みの色から必要なHSV距離（既定値 0.2）
 * @param random 乱数
 * @returns HSV配列
 */
export function generateUniqueColors(hue: number, count = 5, minDistance = 0.2, random: () => number = Math.random): HSV[] {
  const results: HSV[] = []
  const h = clamp(hue, 0, 360)

  for (let attempts = 0; results.length < count && attempts < 20 * count; attempts++) {
    const color = {
      h,
      s: random() * 0.5 + 0.5,
      v: random() * 0.3 + 0.7
    }

    if (!results.some(existing => colorDistanceHSV(color, existing) < minDistance))
      results.push(color)
  }
  return results
}

/**
 * 色相の循環を考慮し、H=2・S=1・V=1.5の重みでHSV距離を算出
 * @param a 比較元のHSV
 * @param b 比較先のHSV
 * @returns 重み付き距離
 */
export function colorDistanceHSV(a: HSV, b: HSV): number {
  const hueDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180
  return Math.sqrt(2 * hueDiff ** 2 + (a.s - b.s) ** 2 + 1.5 * (a.v - b.v) ** 2)
}