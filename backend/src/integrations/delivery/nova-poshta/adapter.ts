import type { DeliveryCapabilitiesDTO, DeliveryLocationDTO } from '@remnant/shared'
import type { AdapterContext, DeliveryCarrierAdapter, LocationQuery } from '../types'
import { HttpError } from '@/utils'
import { novaPoshtaRequest, requireNovaPoshtaApiKey } from './client'
import { lookupNovaPoshtaShipment } from './lookup'
import { isParcelLocker, mapNpCity, mapNpSettlementAddress, mapNpWarehouse } from './map'
import { createNovaPoshtaShipment, getNovaPoshtaLabel } from './shipment'
import { trackNovaPoshtaShipments } from './tracking'

function requireApiKey(ctx: AdapterContext): string {
  return requireNovaPoshtaApiKey(ctx)
}

function isNovaPoshtaRef(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

async function searchCities(apiKey: string, query: string): Promise<DeliveryLocationDTO[]> {
  const q = query.trim()

  if (q !== '') {
    try {
      const settlements = await novaPoshtaRequest<Array<{ Addresses?: unknown[] }>>({
        apiKey,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: q,
          Limit: 20,
        },
      })

      const addresses = settlements.flatMap(item => item.Addresses ?? [])
      const mapped = addresses
        .map(item => mapNpSettlementAddress(item as never))
        .filter((item): item is DeliveryLocationDTO => Boolean(item))

      if (mapped.length)
        return mapped
    }
    catch (error) {
      if (error instanceof HttpError && error.statusCode !== 502)
        throw error
      // network failure — try getCities
    }
  }

  const cities = await novaPoshtaRequest<unknown[]>({
    apiKey,
    modelName: 'Address',
    calledMethod: 'getCities',
    methodProperties: {
      ...(q ? { FindByString: q } : {}),
      Limit: 20,
      Page: '1',
    },
  })

  return cities
    .map(item => mapNpCity(item as never))
    .filter((item): item is DeliveryLocationDTO => Boolean(item))
}

async function searchOffices(
  apiKey: string,
  query: LocationQuery,
  kind: 'office' | 'parcel_locker',
): Promise<DeliveryLocationDTO[]> {
  if (query.parentId == null || query.parentId === '') {
    throw new HttpError(400, 'parentId (city) is required for office search', 'NOVA_POSHTA_CITY_REQUIRED')
  }

  if (!isNovaPoshtaRef(query.parentId)) {
    throw new HttpError(400, 'Select a city from the Nova Poshta list', 'NOVA_POSHTA_CITY_REQUIRED')
  }

  const warehouses = await novaPoshtaRequest<unknown[]>({
    apiKey,
    modelName: 'Address',
    calledMethod: 'getWarehouses',
    methodProperties: {
      CityRef: query.parentId,
      FindByString: query.query ?? '',
      Limit: 50,
    },
  })

  return warehouses
    .map((item) => {
      const warehouse = item as never
      const locker = isParcelLocker(warehouse)
      if (kind === 'parcel_locker' && !locker)
        return null
      if (kind === 'office' && locker)
        return null
      return mapNpWarehouse(warehouse, kind)
    })
    .filter((item): item is DeliveryLocationDTO => Boolean(item))
}

export const novaPoshtaAdapter: DeliveryCarrierAdapter = {
  type: 'novaposhta',

  capabilities(): DeliveryCapabilitiesDTO {
    return {
      type: 'novaposhta',
      methods: ['office', 'parcel_locker'],
      locationFlow: ['city', 'office'],
      canCreateShipment: true,
      canPrintLabel: true,
      canTrack: true,
      canCancel: true,
      requiresCredentials: true,
    }
  },

  async searchLocations(ctx, query) {
    const apiKey = requireApiKey(ctx)

    if (query.kind === 'city')
      return searchCities(apiKey, query.query ?? '')

    if (query.kind === 'office' || query.kind === 'parcel_locker')
      return searchOffices(apiKey, query, query.kind)

    return []
  },

  createShipment: createNovaPoshtaShipment,
  getLabel: getNovaPoshtaLabel,
  trackShipments: trackNovaPoshtaShipments,
  lookupShipment: lookupNovaPoshtaShipment,
}
