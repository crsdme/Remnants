import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getContrastColor(hex: string): 'black' | 'white' {
  const sanitized = hex.replace('#', '')
  const r = Number.parseInt(sanitized.substring(0, 2), 16)
  const g = Number.parseInt(sanitized.substring(2, 4), 16)
  const b = Number.parseInt(sanitized.substring(4, 6), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? 'black' : 'white'
}
