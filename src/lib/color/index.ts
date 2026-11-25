/**
 * 色処理ライブラリの公開インターフェース（Barrel File）
 * 各モジュールの関数および型定義を集約し、外部モジュールへ公開
 * 
 * @example
 * import { hexToRgb, rgbToLab, deltaE } from '@/lib/color'
 */
export type { RGB, HSV, XYZ, Lab } from './types'
export { clamp, normalizeHex, hexToRgb, rgbToHex, rgbToHsv, hsvToRgb } from './conversion'
export { rgbToXyz, xyzToLab, rgbToLab, deltaE, isSimilarColor } from './lab'
export { mergeSimilarColors, sortPaletteByLab, colorDistanceHSV, generateUniqueColors } from './palette'
