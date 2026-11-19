export function languageRecord(value: unknown): Record<string, string> {
  if (value instanceof Map) {
    const record: Record<string, string> = {}
    for (const [key, name] of value.entries()) {
      if (typeof key === 'string' && typeof name === 'string' && name !== '')
        record[key] = name
    }
    return record
  }
  if (value != null && typeof value === 'object') {
    const record: Record<string, string> = {}
    for (const [key, name] of Object.entries(value as Record<string, unknown>)) {
      if (typeof name === 'string' && name !== '')
        record[key] = name
    }
    return record
  }
  return {}
}

export function firstLanguageValue(
  names: Record<string, string>,
  preferred?: string | string[],
): string {
  const codes = preferred == null
    ? []
    : Array.isArray(preferred)
      ? preferred
      : [preferred]

  for (const code of codes) {
    const value = names[code]
    if (value)
      return value
  }

  return Object.values(names).find(value => value !== '') ?? ''
}
