type QueryValue
  = | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean | null | undefined>

export function toQueryString(query: Record<string, QueryValue>): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value == null)
      continue

    if (Array.isArray(value)) {
      for (const v of value) {
        if (v == null)
          continue
        const s = String(v).trim()
        if (!s)
          continue
        params.append(key, s)
      }
      continue
    }

    const s = String(value).trim()
    if (!s)
      continue
    params.set(key, s)
  }

  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleanPath}${query ? toQueryString(query) : ''}`
}
