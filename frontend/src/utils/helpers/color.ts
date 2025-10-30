export function hexToRgb(hex: string) {
  const n = hex.replace('#', '')
  const bigint = Number.parseInt(n.length === 3 ? n.split('').map(c => c + c).join('') : n, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

export function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function getContrastText(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const srgb = (x: number) => {
    const v = x / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const L = 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
  return L > 0.57 ? '#000' : '#fff'
}
