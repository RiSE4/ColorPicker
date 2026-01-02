import { ref, computed } from 'vue'

export function useColor() {
  const hue = ref(0)
  const s = ref(1)
  const v = ref(1)

  function hsvToRgb(h, s, v) {
    const f = (n, k = (n + h / 60) % 6) =>
      v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    return [
      Math.round(f(5) * 255),
      Math.round(f(3) * 255),
      Math.round(f(1) * 255)
    ]
  }

  const hex = computed(() => {
    const [r, g, b] = hsvToRgb(hue.value, s.value, v.value)
    return (
      '#' +
      [r, g, b]
        .map(v => v.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    )
  })

  function setHSV(h, sv, vv) {
    hue.value = Math.max(0, Math.min(360, h))
    s.value = Math.max(0, Math.min(1, sv))
    v.value = Math.max(0, Math.min(1, vv))
  }

  function setHue(h) {
    hue.value = Math.max(0, Math.min(360, h))
  }

  function setSV(sv, vv) {
    s.value = Math.max(0, Math.min(1, sv))
    v.value = Math.max(0, Math.min(1, vv))
  }

  function hexToHsv(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min

    let h = 0
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6
      else if (max === g) h = (b - r) / d + 2
      else h = (r - g) / d + 4
      h *= 60
      if (h < 0) h += 360
    }

    const sv = max === 0 ? 0 : d / max
    return { h, s: sv, v: max }
  }

  function setHex(hex) {
    const { h, s: sv, v: vv } = hexToHsv(hex)
    setHSV(h, sv, vv)
  }

  return {
    hue,
    s,
    v,
    hex,
    setHSV,
    setHue,
    setSV,
    setHex
  }
}