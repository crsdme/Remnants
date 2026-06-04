import type { OrderDTO } from '@remnant/shared'
import type { OrderDBPopulated } from '@/types'

export function mapOrderToDTO(order: OrderDBPopulated): OrderDTO {
  return {
    id: order._id,
    seq: order.seq,
    warehouse: order.warehouse.id,
    deliveryService: order.deliveryService._id,
    orderSource: order.orderSource._id,
    orderStatus: order.orderStatus._id,
    orderPayments: order.orderPayments,
    totals: order.totals,
    client: order.client._id,
    comment: order.comment,
    createdBy: order.createdBy,
    confirmedBy: order.confirmedBy,
    removedBy: order.removedBy,
    removed: order.removed,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}
