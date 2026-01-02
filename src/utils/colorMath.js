export function hsvToRgb(h, s, v) {
  const f = (n, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
  return [
    Math.round(f(5) * 255),
    Math.round(f(3) * 255),
    Math.round(f(1) * 255),
  ]
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x =>
    x.toString(16).padStart(2, '0')
  ).join('').toUpperCase()
}