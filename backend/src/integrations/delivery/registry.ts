import type { DeliveryCarrierType } from '@remnant/shared'
import type { DeliveryCarrierAdapter } from './types'
import { HttpError } from '@/utils'
import { novaPoshtaAdapter } from './nova-poshta/adapter'
import { selfPickupAdapter } from './self-pickup/adapter'

const adapters: Record<DeliveryCarrierType, DeliveryCarrierAdapter> = {
  novaposhta: novaPoshtaAdapter,
  selfpickup: selfPickupAdapter,
}

export function getDeliveryCarrierAdapter(type: DeliveryCarrierType): DeliveryCarrierAdapter {
  const adapter = adapters[type]
  if (!adapter) {
    throw new HttpError(400, 'Unsupported delivery carrier', 'CARRIER_NOT_SUPPORTED')
  }
  return adapter
}
