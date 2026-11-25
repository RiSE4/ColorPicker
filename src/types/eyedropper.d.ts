/**
 * EyeDropper APIの型宣言
 */

/** スポイトが取得したsRGBのHEX */
interface EyeDropperResult { sRGBHex: string }

/** ブラウザが提供するEyeDropper APIのオブジェクト */
interface EyeDropper { open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult> }

/** コンストラクター */
interface EyeDropperConstructor { new(): EyeDropper }

/** 非対応環境用に、省略可能として宣言 */
interface Window { EyeDropper?: EyeDropperConstructor }
