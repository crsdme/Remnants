import type { OrderStatusDTO } from '@remnant/shared'
import type { OrderStatusDB } from '@/types'

export function mapOrderStatusToDTO(orderStatus: OrderStatusDB): OrderStatusDTO {
  return {
    id: orderStatus._id,
    names: orderStatus.names,
    priority: orderStatus.priority,
    color: orderStatus.color,
    isLocked: orderStatus.isLocked,
    isSelectable: orderStatus.isSelectable,
    createdAt: orderStatus.createdAt,
    updatedAt: orderStatus.updatedAt,
  }
}
