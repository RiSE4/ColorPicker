/**
 * 標準EyeDropper APIの対応判定・取得・キャンセルと終了処理を管理する。
 */
import { onUnmounted, ref } from 'vue'
import { normalizeHex } from '@/lib/color'

/** 成功時だけ検証済みHEXを持つ取得結果。キャンセルとAPI失敗を区別する。 */
export type EyeDropperOutcome =
  | { status: 'success'; hex: string }
  | { status: 'cancelled' }
  | { status: 'error' }

/**
 * 多重起動を防ぎ、アンマウント時に実行中の取得を中断する。
 * @returns 実行状態とスポイト起動関数。
 */
export function useEyeDropper() {
  const active = ref(false)
  let controller: AbortController | undefined
  /**
   * ユーザー操作の直後にスポイトを起動する。openの前にawaitを挟まない。
   * @returns 検証済みHEXを含むsuccess、cancelled、またはerror。
   */
  async function pick(): Promise<EyeDropperOutcome> {
    if (!window.isSecureContext || !window.EyeDropper) return { status: 'error' }
    if (active.value) return { status: 'cancelled' }
    active.value = true
    controller = new AbortController()
    try {
      /**
       * open()の前にawaitを挟まず、クリックのユーザーアクティベーションを維持する。
       */
      const result = await new window.EyeDropper().open({ signal: controller.signal })
      const hex = normalizeHex(result.sRGBHex)
      return hex ? { status: 'success', hex } : { status: 'error' }
    } catch (error: unknown) {
      if ((error instanceof DOMException || error instanceof Error) && error.name === 'AbortError') return { status: 'cancelled' }
      return { status: 'error' }
    } finally { active.value = false; controller = undefined }
  }
  onUnmounted(() => controller?.abort())
  return { active, pick }
}
