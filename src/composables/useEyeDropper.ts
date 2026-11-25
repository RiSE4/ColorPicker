/**
 * EyeDropper APIの処理と状態管理
 */
import { onUnmounted, ref } from 'vue'
import { normalizeHex } from '@/lib/color'

/** APIの処理結果を定義 */
export type EyeDropperOutcome =
  | { status: 'success'; hex: string }
  | { status: 'cancelled' }
  | { status: 'error' }

/**
 * EyeDropper APIの起動
 * 多重起動を防ぎ、アンマウント時に実行中の取得を中断
 */
export function useEyeDropper() {
  const active = ref(false)
  let controller: AbortController | undefined

  /**
   * スポイトの起動
   * @returns 検証済みHEXを含むsuccess、cancelled、またはerror
   */
  async function pick(): Promise<EyeDropperOutcome> {
    if (!window.isSecureContext || !window.EyeDropper) return { status: 'error' }
    if (active.value) return { status: 'cancelled' }

    active.value = true
    controller = new AbortController()

    try {
      //open()の前にawaitを挟まず、ユーザーのクリック操作のアクティブ状態を維持
      const result = await new window.EyeDropper().open({ signal: controller.signal })
      const hex = normalizeHex(result.sRGBHex)

      return hex ? { status: 'success', hex } : { status: 'error' }
    } catch (error: unknown) {
      if ((error instanceof DOMException || error instanceof Error) && error.name === 'AbortError')
        return { status: 'cancelled' }

      return { status: 'error' }
    } finally {
      active.value = false; controller = undefined
    }
  }
  onUnmounted(() => controller?.abort())
  return { active, pick }
}
