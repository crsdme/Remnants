import type { AdapterContext } from '../types'
import { DELIVERY_SERVICE_API_KEY_MASK } from '@remnant/shared'
import axios from 'axios'
import { HttpError } from '@/utils'

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/'

interface NovaPoshtaResponse<T> {
  success: boolean
  data: T
  errors: string[]
  warnings: string[]
  info: unknown
}

function isPlaceholderApiKey(apiKey: string): boolean {
  return apiKey === DELIVERY_SERVICE_API_KEY_MASK
    || apiKey.startsWith('seed-')
}

export function usableNovaPoshtaApiKey(value: string | null | undefined): string | undefined {
  const apiKey = value?.trim()
  if (apiKey == null || apiKey === '' || isPlaceholderApiKey(apiKey))
    return undefined
  return apiKey
}

export function requireNovaPoshtaApiKey(ctx: AdapterContext): string {
  const fromCredentials = ctx.credentials?.type === 'novaposhta'
    ? usableNovaPoshtaApiKey(ctx.credentials.apiKey)
    : undefined
  const apiKey = usableNovaPoshtaApiKey(ctx.apiKey) ?? fromCredentials

  if (apiKey == null) {
    throw new HttpError(400, 'Nova Poshta API key is required', 'NOVA_POSHTA_API_KEY_REQUIRED')
  }

  return apiKey
}

function npErrorFromBody(body: NovaPoshtaResponse<unknown> | undefined): string {
  const firstError = body?.errors?.[0]
  if (typeof firstError === 'string' && firstError.trim() !== '')
    return firstError.trim()
  return 'Nova Poshta API error'
}

export async function novaPoshtaRequestRaw<T>(params: {
  apiKey: string
  modelName: string
  calledMethod: string
  methodProperties?: Record<string, unknown>
  timeoutMs?: number
}): Promise<NovaPoshtaResponse<T>> {
  const { apiKey, modelName, calledMethod, methodProperties = {}, timeoutMs = 15000 } = params

  let response
  try {
    response = await axios.post<NovaPoshtaResponse<T>>(NP_API_URL, {
      apiKey,
      modelName,
      calledMethod,
      methodProperties,
    }, {
      timeout: timeoutMs,
      validateStatus: () => true,
    })
  }
  catch (error) {
    const detail = axios.isAxiosError(error) ? error.message : 'Nova Poshta API request failed'
    throw new HttpError(502, 'Nova Poshta API request failed', 'NOVA_POSHTA_REQUEST_FAILED', detail)
  }

  const body = response.data
  if (body == null || typeof body !== 'object') {
    throw new HttpError(
      502,
      'Nova Poshta API request failed',
      'NOVA_POSHTA_REQUEST_FAILED',
      `HTTP ${response.status}`,
    )
  }

  return body
}

export async function novaPoshtaRequest<T>(params: {
  apiKey: string
  modelName: string
  calledMethod: string
  methodProperties?: Record<string, unknown>
  timeoutMs?: number
}): Promise<T> {
  const body = await novaPoshtaRequestRaw<T>(params)
  if (body.success !== true) {
    const message = npErrorFromBody(body)
    throw new HttpError(400, message, 'NOVA_POSHTA_API_ERROR', message)
  }

  return body.data
}
