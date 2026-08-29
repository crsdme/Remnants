import type { SiteContext } from './types'
import axios from 'axios'
import { buildUrl } from '@/utils'
import { SiteSyncError } from './errors'

interface SiteResponse<T> {
  ok?: boolean
  data?: T
  error?: string
}

export async function siteRequest<T>(params: {
  ctx: SiteContext
  action: string
  method?: 'GET' | 'POST'
  body?: unknown
  timeoutMs?: number
}): Promise<T> {
  const { ctx, action, method = 'GET', body, timeoutMs = 30000 } = params

  if (ctx.url.trim() === '' || ctx.key.trim() === '')
    throw new SiteSyncError('Site url and key are required')

  const url = buildUrl(ctx.url.trim(), '/index.php', {
    route: `extension/module/remnant/${action}`,
    key: ctx.key.trim(),
  })

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

  const payload = response.data
  if (payload == null || typeof payload !== 'object')
    throw new SiteSyncError(`HTTP ${response.status}`, response.status)

  if (payload.ok !== true) {
    const message = typeof payload.error === 'string' && payload.error !== ''
      ? payload.error
      : `HTTP ${response.status}`
    throw new SiteSyncError(message, response.status)
  }

  return payload.data as T
}
