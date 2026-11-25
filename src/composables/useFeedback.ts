/**
 * 操作ごとに独立したコピー・追加・失敗のアニメーション状態とタイマーを管理
 */
import { onUnmounted, ref } from 'vue'

/** 操作の成否と、アイコンがフェード段階に入ったかを保持する描画状態 */
export interface FeedbackState { error: boolean; fading: boolean }

/** 操作キーごとの描画状態 */
export type Feedback = Readonly<Record<string, FeedbackState | undefined>>

/**
 * アニメーション処理の定義
 */
export function useFeedback() {
  const feedback = ref<Record<string, FeedbackState | undefined>>({})
  const timers = new Map<string, ReturnType<typeof setTimeout>[]>()

  /**
   * アニメーション処理
   */
  function animate(key: string, error = false) {
    timers.get(key)?.forEach(clearTimeout)
    feedback.value[key] = { error, fading: false }

    //500msでフェード開始、800msで元のアイコンへ戻す
    //パレットの枠は1000msで統一
    const palette = key.startsWith('palette-')
    const pending: ReturnType<typeof setTimeout>[] = []

    if (!palette) pending.push(setTimeout(() => {
      const state = feedback.value[key]
      if (state)
        state.fading = true
    }, 500))

    pending.push(setTimeout(() => {
      delete feedback.value[key]
      timers.delete(key)
    }, palette ? 1000 : 800))

    timers.set(key, pending)
  }

  /**
   * クリップボードへのコピー処理
   */
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      animate(key)
    } catch { animate(key, true) }
  }
  onUnmounted(() => {
    timers.forEach(pending => pending.forEach(clearTimeout));
    timers.clear();
  })

  return { feedback, animate, copy }
}
