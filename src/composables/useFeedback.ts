/**
 * 操作ごとに独立したコピー・追加・失敗のアニメーション状態とタイマーを管理する。
 */
import { onUnmounted, ref } from 'vue'

/** 操作の成否と、アイコンがフェード段階に入ったかを保持する描画状態。 */
export interface FeedbackState { error: boolean; fading: boolean }
/** 操作キーごとの描画状態。未登録キーは演出していない状態を表す。 */
export type Feedback = Readonly<Record<string, FeedbackState | undefined>>

/**
 * ボタンは500msでフェード、800msで復元。パレットのコピー表示は1000ms保持する。
 * @returns 描画用の状態とアニメーション・コピー操作。
 */
export function useFeedback() {
  const feedback = ref<Record<string, FeedbackState | undefined>>({})
  const timers = new Map<string, ReturnType<typeof setTimeout>[]>()
  /**
   * 同一キーの前回タイマーを解除して演出を開始する。
   * @param key 操作を識別するキー。palette-接頭辞はパレット用。
   * @param error trueなら失敗の演出にする。
   */
  function animate(key: string, error = false) {
    timers.get(key)?.forEach(clearTimeout)
    feedback.value[key] = { error, fading: false }
    /**
     * 本番util.js: 500msでフェード開始、800msで元のアイコンへ戻す。
     */
    /**
     * パレットのコピー枠だけは本番showCopyNoticeと同じ1000ms。
     */
    const palette = key.startsWith('palette-')
    const pending: ReturnType<typeof setTimeout>[] = []
    if (!palette) pending.push(setTimeout(() => {
      const state = feedback.value[key]
      if (state) state.fading = true
    }, 500))
    pending.push(setTimeout(() => {
      delete feedback.value[key]
      timers.delete(key)
    }, palette ? 1000 : 800))
    timers.set(key, pending)
  }
  /**
   * クリップボードへの書き込み結果に応じた演出を開始する。
   * @param text コピーする文字列。
   * @param key 演出対象の操作キー。
   * @returns 書き込みと演出開始の完了を表すPromise。
   */
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      animate(key)
    } catch { animate(key, true) }
  }
  onUnmounted(() => { timers.forEach(pending => pending.forEach(clearTimeout)); timers.clear() })
  return { feedback, animate, copy }
}
