export function buildUrl(baseUrl: string, path: string, params: Record<string, string> = {}): string {
  const hasScheme = /^https?:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`

  const url = new URL(path, hasScheme)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}
