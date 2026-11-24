/**
 * 色計算モジュールで共有する座標型と単位。
 */
/** sRGBの赤・緑・青成分。通常は各成分0–255の整数を使用する。 */
export interface RGB { r: number; g: number; b: number }
/** 色相hは0–360度、彩度sと明度vは0–1。UIの百分率とは区別する。 */
export interface HSV { h: number; s: number; v: number }
/** D65基準のXYZ座標。Y=1のスケールで扱う。 */
export interface XYZ { x: number; y: number; z: number }
/** CIELABの明度Lと色度a・b。色差計算まで中間値を丸めない。 */
export interface Lab { L: number; a: number; b: number }
