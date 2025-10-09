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

// --------------AI BRUH---------------

interface Change { path: string, before: any, after: any }

// утилита для чтения значения по пути "a.b.c"
function getByPath(obj: any, path: string) {
  if (!path)
    return obj
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
}

// обёртка: делает changes[] на основе результата getDifferenceDeep
export function diffToChangesFromDeep(prev: any, next: any): Change[] {
  const diff = getDifferenceDeep(prev, next)
  const changes: Change[] = []

  const isPlainObject = (v: any) =>
    Object.prototype.toString.call(v) === '[object Object]'

  const walk = (node: any, basePath: string) => {
    // если в diff лежит не объект (примитив/массив) — это «замена целиком» по basePath
    if (!isPlainObject(node)) {
      if (!basePath)
        return // корень без пути нам не нужен
      changes.push({
        path: basePath,
        before: getByPath(prev, basePath),
        after: getByPath(next, basePath),
      })
      return
    }

    for (const key of Object.keys(node)) {
      const child = node[key]
      const path = basePath ? `${basePath}.${key}` : key

      if (isPlainObject(child)) {
        // в diff остались вложенные различия — спускаемся
        walk(child, path)
      }
      else {
        // в diff лежит «final» значение (массив/примитив) — фиксируем изменение по этому пути
        changes.push({
          path,
          before: getByPath(prev, path),
          after: getByPath(next, path),
        })
      }
    }
  }

  walk(diff, '')
  return changes
}
