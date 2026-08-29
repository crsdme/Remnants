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

export function firstLanguageValue(names: Record<string, string>, preferred = ['ru', 'en']): string {
  for (const code of preferred) {
    if (names[code])
      return names[code]
  }
  return Object.values(names)[0] ?? ''
}
