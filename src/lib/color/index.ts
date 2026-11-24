/**
 * Vue・DOM非依存の公開API。ディレクトリ単位で別プロジェクトへ取り込める。
 * RGB: 0–255、HSV: h=0–360 / s,v=0–1、XYZ: D65 / Y=1。
 * 例: deltaE(rgbToLab(hexToRgb('#FF0000')), rgbToLab(hexToRgb('#FE0101')))
 * mainと同じCIE76を使用し、LAB変換の中間値を丸めない。
 */
export type { RGB, HSV, XYZ, Lab } from './types'
export { clamp, normalizeHex, hexToRgb, rgbToHex, rgbToHsv, hsvToRgb } from './conversion'
export { rgbToXyz, xyzToLab, rgbToLab, deltaE, isSimilarColor } from './lab'
export { mergeSimilarColors, sortPaletteByLab, colorDistanceHSV, generateUniqueColors } from './palette'
