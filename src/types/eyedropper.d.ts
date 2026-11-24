/**
 * DOM標準型に含まれないEyeDropper APIの最小限の型宣言。対応していないWindowも許容する。
 */
/** スポイトが取得したsRGBのHEX値。利用時には形式を検証する。 */
interface EyeDropperResult { sRGBHex: string }
/** openで選択を開始し、AbortSignalで中断できるブラウザ提供オブジェクト。 */
interface EyeDropper { open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult> }
/** ユーザー操作から生成するEyeDropperのコンストラクター。 */
interface EyeDropperConstructor { new(): EyeDropper }
/** 非対応環境ではEyeDropperが存在しないため、省略可能として宣言する。 */
interface Window { EyeDropper?: EyeDropperConstructor }
