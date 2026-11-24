/**
 * colorPaletteキーのHEX配列を引き継ぎ、Vueのパレット状態と保存処理を管理する。
 */
import { readonly, ref } from 'vue'
import { mergeSimilarColors, normalizeHex, sortPaletteByLab } from '@/lib/color'

export const PALETTE_KEY = 'colorPalette'

/**
 * 保存済みの値を検証・正規化して復元し、重複を取り除く。保存拒否時も操作を継続する。
 * @returns 読み取り専用の色配列と追加・削除・結合・整列の操作。
 */
export function usePalette() {
  const colors = ref<string[]>([])
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PALETTE_KEY) ?? '[]')
    if (!Array.isArray(saved)) throw new Error('Invalid palette')
    for (const value of saved) {
      const hex = normalizeHex(value)
      if (hex && !colors.value.includes(hex)) colors.value.push(hex)
    }
  } catch { /* 壊れたJSONや保存拒否でも、空のパレットで操作を継続する。 */ }

  /**
   * 現在の配列をJSONで保存する。
   * @param remove trueの場合は保存キー自体を削除する。
   */
  function persist(remove = false) {
    try {
      if (remove) localStorage.removeItem(PALETTE_KEY)
      else localStorage.setItem(PALETTE_KEY, JSON.stringify(colors.value))
    } catch { /* 保存できない環境でもメモリ上のパレットは維持する。 */ }
  }
  /**
   * 色を正規化して追加し、追加できた場合だけ保存する。
   * @param hex 追加するHEX。
   * @returns 有効かつ未登録の色を追加した場合true。
   */
  function add(hex: string): boolean { return addMany([hex]) > 0 }
  /**
   * 有効で未登録の色を順番に追加し、まとめて保存する。
   * @param values 追加候補のHEX配列。
   * @returns 実際に追加した件数。
   */
  function addMany(values: readonly string[]): number {
    const before = colors.value.length
    for (const value of values) {
      const hex = normalizeHex(value)
      if (hex && !colors.value.includes(hex)) colors.value.push(hex)
    }
    const added = colors.value.length - before
    if (added) persist()
    return added
  }
  /**
   * 指定色を削除して保存する。
   * @param hex 削除対象の正規化済みHEX。
   */
  function remove(hex: string) { colors.value = colors.value.filter(color => color !== hex); persist() }
  /**
   * 画面の全色とlocalStorageの保存キーを削除する。確認操作は呼び出し元が行う。
   */
  function clear() { colors.value = []; persist(true) }
  /**
   * 純粋な色差計算の結果をパレットへ反映して保存する。
   * @param threshold ΔE76のしきい値。
   * @returns 結合によって取り除いた色の数。
   */
  function merge(threshold: number) {
    const before = colors.value.length
    colors.value = mergeSimilarColors(colors.value, threshold)
    persist()
    return before - colors.value.length
  }
  /**
   * LAB最近傍順へ並び替え、並び順を保存する。
   */
  function sort() { colors.value = sortPaletteByLab(colors.value); persist() }
  return { colors: readonly(colors), add, addMany, remove, clear, merge, sort }
}
