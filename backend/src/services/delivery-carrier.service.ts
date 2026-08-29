import type {
  DeliveryLocationDTO,
  DeliveryServiceCredentials,
  GetDeliveryCapabilitiesResponse,
  GetDeliveryLocationsResponse,
  LookupDeliveryShipmentData,
  LookupDeliveryShipmentResponse,
} from '@remnant/shared'
import type {
  GetDeliveryCapabilitiesPayload,
  GetDeliveryLocationsPayload,
  LookupDeliveryShipmentPayload,
} from '@/types/delivery-carrier.type'
import { DELIVERY_SERVICE_API_KEY_MASK, deliveryServiceCredentialsSchema } from '@remnant/shared'
import { getDeliveryCarrierAdapter } from '@/integrations/delivery'
import * as DeliveryServicesRepo from '@/repositories/delivery-services.repo'
import { HttpError } from '@/utils/'

const locationCache = new Map<string, { expiresAt: number, items: GetDeliveryLocationsResponse['data']['items'] }>()
const LOCATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000

function cacheKey(parts: Array<string | undefined>) {
  return parts.map(part => part ?? '').join('|')
}

function usableApiKey(value: string | null | undefined): string | undefined {
  const apiKey = value?.trim()
  if (apiKey == null || apiKey === '' || apiKey === DELIVERY_SERVICE_API_KEY_MASK || apiKey.startsWith('seed-'))
    return undefined
  return apiKey
}

function storedApiKey(credentials: DeliveryServiceCredentials | undefined): string | undefined {
  if (credentials?.type !== 'novaposhta')
    return undefined
  return usableApiKey(credentials.apiKey)
}

export async function getCapabilities({
  payload,
}: {
  payload: GetDeliveryCapabilitiesPayload
}): Promise<GetDeliveryCapabilitiesResponse> {
  let type = payload.type

  if (payload.id !== undefined && payload.id !== '') {
    const service = await DeliveryServicesRepo.findById(payload.id)
    if (!service) {
      throw new HttpError(404, 'Delivery service not found', 'DELIVERY_SERVICE_NOT_FOUND')
    }
    type = service.type
  }

  if (!type) {
    throw new HttpError(400, 'id or type is required', 'CARRIER_TYPE_REQUIRED')
  }

  const adapter = getDeliveryCarrierAdapter(type)

  return {
    status: 'success',
    code: 'DELIVERY_CAPABILITIES_FETCHED',
    message: 'Delivery capabilities fetched',
    data: adapter.capabilities(),
  }
}

export async function getLocations({
  payload,
}: {
  payload: GetDeliveryLocationsPayload
}): Promise<GetDeliveryLocationsResponse> {
  let apiKey = usableApiKey(payload.apiKey)
  let type = payload.type ?? 'novaposhta'
  let credentials: DeliveryServiceCredentials | undefined

  if (payload.id !== '' && payload.id !== undefined) {
    const service = await DeliveryServicesRepo.findById(payload.id)
    if (!service) {
      throw new HttpError(404, 'Delivery service not found', 'DELIVERY_SERVICE_NOT_FOUND')
    }
    type = service.type
    credentials = service.credentials
    apiKey = apiKey ?? storedApiKey(credentials)
  }

  const adapter = getDeliveryCarrierAdapter(type)
  const key = cacheKey([type, payload.kind, payload.parentId, payload.query, payload.id, apiKey !== undefined ? 'key' : ''])
  const cached = locationCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return {
      status: 'success',
      code: 'DELIVERY_LOCATIONS_FETCHED',
      message: 'Delivery locations fetched',
      data: {
        items: cached.items,
        pagination: {
          page: 1,
          pageSize: cached.items.length,
          total: cached.items.length,
        },
      },
    }
  }

  const items = await adapter.searchLocations(
    { apiKey, credentials },
    {
      kind: payload.kind,
      query: payload.query,
      parentId: payload.parentId,
    },
  )

  locationCache.set(key, {
    items,
    expiresAt: Date.now() + LOCATION_CACHE_TTL_MS,
  })

  return {
    status: 'success',
    code: 'DELIVERY_LOCATIONS_FETCHED',
    message: 'Delivery locations fetched',
    data: {
      items,
      pagination: {
        page: 1,
        pageSize: items.length,
        total: items.length,
      },
    },
  }
}

function isNonEmpty(value: string | null | undefined): value is string {
  return value != null && value !== ''
}

function pickLocation(items: DeliveryLocationDTO[], query?: string): DeliveryLocationDTO | undefined {
  if (items.length === 0)
    return undefined
  if (query == null || query === '')
    return items[0]
  const q = query.toLowerCase()
  return items.find(item => item.name.toLowerCase() === q)
    ?? items.find(item => item.name.toLowerCase().includes(q) || q.includes(item.name.toLowerCase()))
    ?? items[0]
}

export async function lookupShipment({
  payload,
}: {
  payload: LookupDeliveryShipmentPayload
}): Promise<LookupDeliveryShipmentResponse> {
  const service = await DeliveryServicesRepo.findById(payload.id)
  if (!service)
    throw new HttpError(404, 'Delivery service not found', 'DELIVERY_SERVICE_NOT_FOUND')

  const adapter = getDeliveryCarrierAdapter(service.type)
  if (adapter.lookupShipment == null) {
    throw new HttpError(400, 'Shipment lookup is not supported for this delivery service', 'SHIPMENT_NOT_SUPPORTED')
  }

  const credentialsParsed = deliveryServiceCredentialsSchema.safeParse(service.credentials)
  const credentials = credentialsParsed.success ? credentialsParsed.data : service.credentials
  const apiKey = storedApiKey(credentials)
  const ctx = { apiKey, credentials }
  const lookedUp = await adapter.lookupShipment(ctx, payload.trackingNumber)

  const method = lookedUp.isLocker ? 'parcel_locker' : 'office'
  let city = isNonEmpty(lookedUp.cityRef) && isNonEmpty(lookedUp.cityName)
    ? { id: lookedUp.cityRef, name: lookedUp.cityName }
    : undefined
  let point = isNonEmpty(lookedUp.pointRef) && isNonEmpty(lookedUp.pointName)
    ? { id: lookedUp.pointRef, name: lookedUp.pointName }
    : undefined

  if (city == null && isNonEmpty(lookedUp.cityName)) {
    const cities = await adapter.searchLocations(ctx, { kind: 'city', query: lookedUp.cityName })
    const matched = pickLocation(cities, lookedUp.cityName)
    if (matched)
      city = { id: matched.id, name: matched.name }
  }

  if (point == null && city != null && isNonEmpty(lookedUp.pointName)) {
    const points = await adapter.searchLocations(ctx, {
      kind: method,
      query: lookedUp.pointName,
      parentId: city.id,
    })
    const matched = pickLocation(points, lookedUp.pointName)
    if (matched)
      point = { id: matched.id, name: matched.name }
  }

  const snapshotLabel = [city?.name ?? lookedUp.cityName, point?.name ?? lookedUp.pointName]
    .filter((part): part is string => isNonEmpty(part))
    .join(' · ')

  const data: LookupDeliveryShipmentData = {
    trackingNumber: lookedUp.trackingNumber,
    ownedByAccount: lookedUp.ownedByAccount,
    method,
    ...(isNonEmpty(lookedUp.recipientName) ? { recipientName: lookedUp.recipientName } : {}),
    ...(isNonEmpty(lookedUp.recipientPhone) ? { recipientPhone: lookedUp.recipientPhone } : {}),
    ...(city != null ? { city } : {}),
    ...(point != null ? { point } : {}),
    ...(snapshotLabel !== '' ? { snapshotLabel } : {}),
    ...(lookedUp.seats != null ? { seats: lookedUp.seats } : {}),
    ...(lookedUp.declaredValueMinor != null ? { declaredValueMinor: lookedUp.declaredValueMinor } : {}),
    ...(lookedUp.weightKg != null ? { weightKg: lookedUp.weightKg } : {}),
    ...(isNonEmpty(lookedUp.description) ? { description: lookedUp.description } : {}),
    ...(lookedUp.payer != null ? { payer: lookedUp.payer } : {}),
    ...(isNonEmpty(lookedUp.documentRef) ? { documentRef: lookedUp.documentRef } : {}),
  }

  return {
    status: 'success',
    code: 'DELIVERY_SHIPMENT_LOOKED_UP',
    message: 'Shipment details fetched',
    data,
  }
}
