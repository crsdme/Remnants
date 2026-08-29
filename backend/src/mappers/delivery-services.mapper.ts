import type { DeliveryServiceDTO } from '@remnant/shared'
import type { DeliveryServiceDB } from '@/types'
import { DELIVERY_SERVICE_API_KEY_MASK } from '@remnant/shared'

export function mapDeliveryServiceToDTO(deliveryService: DeliveryServiceDB): DeliveryServiceDTO {
  let credentials: DeliveryServiceDTO['credentials']

  if (deliveryService.credentials?.type === 'selfpickup') {
    credentials = { type: 'selfpickup' }
  }
  else if (deliveryService.credentials?.type === 'novaposhta') {
    const hasApiKey = Boolean(deliveryService.credentials.apiKey)
    credentials = {
      type: 'novaposhta',
      apiKey: hasApiKey ? DELIVERY_SERVICE_API_KEY_MASK : '',
      hasApiKey,
      phone: deliveryService.credentials.phone,
      sender: deliveryService.credentials.sender,
    }
  }

  return {
    id: deliveryService._id,
    names: deliveryService.names,
    type: deliveryService.type,
    color: deliveryService.color,
    priority: deliveryService.priority,
    active: deliveryService.active,
    credentials,
    createdAt: deliveryService.createdAt,
    updatedAt: deliveryService.updatedAt,
  }
}
