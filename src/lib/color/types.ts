/**
 * 色計算モジュールで共有する座標型と単位
 */

/** sRGB(0-255, 0-255, 0-255) */
export interface RGB { r: number; g: number; b: number }

/** HSV(0-360, 0-1, 0-1) */
export interface HSV { h: number; s: number; v: number }

/** D65基準のXYZ座標(Y=1) */
export interface XYZ { x: number; y: number; z: number }

/** CIELABの明度Lと色度a・b */
export interface Lab { L: number; a: number; b: number }
