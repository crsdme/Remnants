import { isEqual, isPlainObject } from 'lodash'

export function getDifference(oldObj: any, newObj: any) {
  const diff: any = {}

  for (const key of Object.keys(newObj)) {
    if (typeof newObj[key] === 'undefined')
      continue

    if (!isEqual(oldObj[key], newObj[key])) {
      diff[key] = newObj[key]
    }
  }

  return diff
}

export function getDifferenceDeep(prev: any, next: any) {
  if (isEqual(prev, next))
    return Array.isArray(prev) ? [] : {}

  if (Array.isArray(prev) || Array.isArray(next)) {
    if (typeof next === 'undefined')
      return Array.isArray(prev) ? [] : {}
    return next
  }

  if (!isPlainObject(prev) || !isPlainObject(next)) {
    return next
  }

  const result: any = {}
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])

  for (const key of keys) {
    const a = prev[key]
    const b = next[key]

    if (!(key in next))
      continue

    if (!isEqual(a, b)) {
      if (Array.isArray(a) || Array.isArray(b)) {
        result[key] = b
      }
      else if (isPlainObject(a) && isPlainObject(b)) {
        const nested = getDifferenceDeep(a, b)
        if (Array.isArray(nested)) {
          result[key] = b
        }
        else if (Object.keys(nested).length) {
          result[key] = nested
        }
      }
      else {
        result[key] = b
      }
    }
  }

  return result
}
