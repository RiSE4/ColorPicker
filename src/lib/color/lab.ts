/**
 * sRGBからD65のXYZ・CIELABへ変換し、CIE76方式で色差を求める純粋関数。
 */
import type { Lab, RGB, XYZ } from './types'
import { clamp } from './conversion'

/**
 * mainと同じ行列係数・ガンマ補正を使い、中間値を丸めず変換する。
 * @param param0 各成分0–255のsRGB。
 * @returns D65、Y=1スケールのXYZ。
 */
export function rgbToXyz({ r, g, b }: RGB): XYZ {
  const gamma = (v: number) => {
    v = clamp(v, 0, 255) / 255
    return v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92
  }
  r = gamma(r); g = gamma(g); b = gamma(b)
  return { x: r * 0.4124 + g * 0.3576 + b * 0.1805, y: r * 0.2126 + g * 0.7152 + b * 0.0722, z: r * 0.0193 + g * 0.1192 + b * 0.9505 }
}

/**
 * D65白色点とmainの区分境界・係数でCIELABへ変換する。
 * @param param0 Y=1スケールのXYZ。
 * @returns 丸めていないL・a・b。
 * @throws RangeError 非有限の成分が指定された場合。
 */
export function xyzToLab({ x, y, z }: XYZ): Lab {
  if (![x, y, z].every(Number.isFinite)) throw new RangeError('有限のXYZ値を指定してください')
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116
  x /= 0.95047; z /= 1.08883
  return { L: 116 * f(y) - 16, a: 500 * (f(x) - f(y)), b: 200 * (f(y) - f(z)) }
}

/**
 * sRGBからXYZを経由してCIELABへ変換する。
 * @param rgb 変換元のRGB。
 * @returns D65基準のCIELAB。
 */
export function rgbToLab(rgb: RGB): Lab { return xyzToLab(rgbToXyz(rgb)) }

/**
 * CIELABのユークリッド距離を求める。CIEDE2000ではなく既存のCIE76を維持する。
 * @param lab1 比較元。
 * @param lab2 比較先。
 * @returns ΔE76。同じ色なら0。
 */
export function deltaE(lab1: Lab, lab2: Lab): number {
  const dL = lab1.L - lab2.L, da = lab1.a - lab2.a, db = lab1.b - lab2.b
  return Math.sqrt(dL * dL + da * da + db * db)
}

/**
 * RGB同士をCIELABへ変換し、色差を判定する。
 * @param a 比較元のRGB。
 * @param b 比較先のRGB。
 * @param threshold 色差のしきい値。
 * @returns ΔEがしきい値未満の場合true。等しい場合はfalse。
 */
export function isSimilarColor(a: RGB, b: RGB, threshold: number): boolean {
  return deltaE(rgbToLab(a), rgbToLab(b)) < threshold
}
