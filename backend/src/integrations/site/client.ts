import type { SiteContext } from './types'
import axios from 'axios'
import { SiteSyncError } from './errors'
import { REQUIRED_SITE_MODULE_PROTOCOL } from './version'

const PROTOCOL_CACHE_MS = 120_000
const protocolCache = new Map<string, { version: number, checkedAt: number }>()

function buildSiteRequestUrl(baseUrl: string, action: string, key: string, extra: Record<string, string> = {}): string {
  const withScheme = /^https?:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`
  const url = new URL('/index.php', withScheme)
  // OpenCart reads route with literal slashes; URLSearchParams would encode them as %2F.
  const params = [`route=extension/module/remnant/${action}`, `key=${encodeURIComponent(key)}`]
  for (const [name, value] of Object.entries(extra)) {
    if (value !== '')
      params.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
  }
  return `${url.origin}${url.pathname}?${params.join('&')}`
}

interface SiteResponse<T> {
  ok?: boolean
  data?: T
  error?: string
  version?: number
}

function cacheKey(ctx: SiteContext): string {
  return `${ctx.url.trim()}\0${ctx.key.trim()}`
}

function readProtocolVersion(payload: SiteResponse<unknown>): number {
  if (typeof payload.version === 'number' && Number.isFinite(payload.version))
    return payload.version

  const data = payload.data
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const nested = (data as { version?: unknown }).version
    if (typeof nested === 'number' && Number.isFinite(nested))
      return nested
  }

  return 0
}

function rememberProtocol(ctx: SiteContext, version: number) {
  protocolCache.set(cacheKey(ctx), { version, checkedAt: Date.now() })
}

function hasFreshProtocol(ctx: SiteContext): boolean {
  const cached = protocolCache.get(cacheKey(ctx))
  if (cached == null)
    return false
  if (Date.now() - cached.checkedAt > PROTOCOL_CACHE_MS)
    return false
  return cached.version >= REQUIRED_SITE_MODULE_PROTOCOL
}

function assertProtocolVersion(version: number): void {
  if (version >= REQUIRED_SITE_MODULE_PROTOCOL)
    return
  throw new SiteSyncError('Site module is outdated', undefined, true)
}

async function ensureSiteModuleProtocol(ctx: SiteContext): Promise<void> {
  if (hasFreshProtocol(ctx))
    return
  await siteRequest({ ctx, action: 'ping', method: 'GET', skipProtocolCheck: true })
}

export async function siteRequest<T>(params: {
  ctx: SiteContext
  action: string
  method?: 'GET' | 'POST'
  body?: unknown
  query?: Record<string, string>
  timeoutMs?: number
  skipProtocolCheck?: boolean
}): Promise<T> {
  const { ctx, action, method = 'GET', body, query, timeoutMs = 30000, skipProtocolCheck = false } = params

  if (ctx.url.trim() === '' || ctx.key.trim() === '')
    throw new SiteSyncError('Site url and key are required')

  if (!skipProtocolCheck && action !== 'ping')
    await ensureSiteModuleProtocol(ctx)

  const url = buildSiteRequestUrl(ctx.url.trim(), action, ctx.key.trim(), query ?? {})

  let response
  try {
    response = await axios.request<SiteResponse<T>>({
      url,
      method,
      data: method === 'POST' ? body : undefined,
      timeout: timeoutMs,
      validateStatus: () => true,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  catch (error) {
    const detail = axios.isAxiosError(error) ? error.message : 'Site request failed'
    throw new SiteSyncError(detail)
  }

  if (response.status === 404)
    throw new SiteSyncError(`HTTP ${response.status}`, response.status)

  const payload = response.data
  if (payload == null || typeof payload !== 'object' || Array.isArray(payload))
    throw new SiteSyncError(`HTTP ${response.status}`, response.status)

  if (payload.ok !== true) {
    const message = typeof payload.error === 'string' && payload.error !== ''
      ? payload.error
      : `HTTP ${response.status}`
    throw new SiteSyncError(message, response.status)
  }

  const version = readProtocolVersion(payload)
  assertProtocolVersion(version)
  rememberProtocol(ctx, version)

  return payload.data as T
}
