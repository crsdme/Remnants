import type { DeliveryServiceDTO } from '@remnant/shared'
import type { DeliveryServiceDB } from '@/types'

export function mapDeliveryServiceToDTO(deliveryService: DeliveryServiceDB): DeliveryServiceDTO {
  return {
    id: deliveryService._id,
    names: deliveryService.names,
    type: deliveryService.type,
    color: deliveryService.color,
    priority: deliveryService.priority,
    active: deliveryService.active,
    createdAt: deliveryService.createdAt,
    updatedAt: deliveryService.updatedAt,
  }
}
