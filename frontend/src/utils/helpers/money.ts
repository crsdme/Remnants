/** Convert a major-unit amount to minor units (integer). */
export function toMinor(amount: number, scale = 2): number {
  const safeScale = Math.max(0, Math.trunc(scale))
  return Math.round((Number(amount) || 0) * 10 ** safeScale)
}

/** Convert minor units to a major-unit decimal string. */
export function fromMinor(minor: number, scale = 2): string {
  const safeScale = Math.max(0, Math.trunc(scale))
  const value = Math.trunc(Number(minor) || 0)

  if (safeScale === 0)
    return String(value)

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value).toString().padStart(safeScale + 1, '0')
  const head = abs.slice(0, -safeScale) || '0'
  const tail = abs.slice(-safeScale)
  return `${sign}${head}.${tail}`
}

/** Format minor amount for UI (drops trailing zeros). */
export function formatMinor(minor: number, scale = 2): string {
  return Number(fromMinor(minor, scale)).toString()
}
