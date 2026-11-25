/**
 * カラーパレットを反映する処理と状態管理
 */
import { readonly, ref } from 'vue'
import { mergeSimilarColors, normalizeHex, sortPaletteByLab } from '@/lib/color'

//localStorageで使用するキー
export const PALETTE_KEY = 'colorPalette'

/**
 * 保存済みの値を検証・正規化して復元し、重複を取り除く
 */
export function usePalette() {
  const colors = ref<string[]>([])

  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PALETTE_KEY) ?? '[]')

    if (!Array.isArray(saved))
      throw new Error('Invalid palette')

    for (const value of saved) {
      const hex = normalizeHex(value)

      if (hex && !colors.value.includes(hex))
        colors.value.push(hex)
    }
  } catch {
    //何もしない
  }

  /**
   * 配列をJSONで保存
   * @param remove trueの場合はキーごとを削除
   */
  function persist(remove = false) {
    try {
      if (remove) {
        localStorage.removeItem(PALETTE_KEY)
      } else {
        localStorage.setItem(PALETTE_KEY, JSON.stringify(colors.value))
      }
    } catch {
      //保存できない環境では何もしない
    }
  }

  /**
   * 色を正規化して追加し、追加できた場合だけ保存
   * @param hex HEX
   * @returns 有効かつ未登録の色を追加した場合のみtrue
   */
  function add(hex: string): boolean {
    return addMany([hex]) > 0
  }

  /**
   * 有効で未登録の色を順番に追加し、まとめて保存
   * @param values HEXの配列
   * @returns 実際に追加した件数
   */
  function addMany(values: readonly string[]): number {
    const before = colors.value.length

    for (const value of values) {
      const hex = normalizeHex(value)

      if (hex && !colors.value.includes(hex))
        colors.value.push(hex)
    }

    const added = colors.value.length - before
    if (added)
      persist()

    return added
  }

  /**
   * 指定した色を削除して保存
   * @param hex 削除対象のHEX
   */
  function remove(hex: string) {
    colors.value = colors.value.filter(color => color !== hex);
    persist();
  }

  /**
   * 画面の全色とlocalStorageのキーを削除
   */
  function clear() {
    colors.value = [];
    persist(true);
  }

  /**
   * 色差計算の結果をパレットへ反映して保存
   * @param threshold ΔE76のしきい値
   * @returns 結合によって取り除いた色の数
   */
  function merge(threshold: number) {
    const before = colors.value.length
    colors.value = mergeSimilarColors(colors.value, threshold)
    persist()
    return before - colors.value.length
  }

  /**
   * パレットをCIELAB順で並び替え
   */
  function sort() {
    colors.value = sortPaletteByLab(colors.value);
    persist();
  }

  return { colors: readonly(colors), add, addMany, remove, clear, merge, sort }
}
