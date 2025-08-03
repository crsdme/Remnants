import { isEqual, transform } from 'lodash'

export function getDifference(oldObj: any, newObj: any) {
  const diff: any = {}

  for (const key of Object.keys(newObj)) {
    // Пропускаем, если ключа нет в старом объекте и значение undefined
    if (typeof newObj[key] === 'undefined')
      continue

    if (!isEqual(oldObj[key], newObj[key])) {
      diff[key] = newObj[key]
    }
  }

  return diff
}

export function getDifferenceDeep(obj: any, other: any) {
  return transform(obj, (result: any, value, key) => {
    if (!isEqual(value, other[key])) {
      result[key] = (typeof value === 'object' && typeof other[key] === 'object')
        ? getDifferenceDeep(value, other[key])
        : other[key]
    }
  })
}
