import type { OrderSourceDTO } from '@remnant/shared'
import type { OrderSourceDB } from '@/types'

export function mapOrderSourceToDTO(orderSource: OrderSourceDB): OrderSourceDTO {
  return {
    id: orderSource._id,
    names: orderSource.names,
    priority: orderSource.priority,
    color: orderSource.color,
    removed: orderSource.removed,
    createdAt: orderSource.createdAt,
    updatedAt: orderSource.updatedAt,
  }
}
