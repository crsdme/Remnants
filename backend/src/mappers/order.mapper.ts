import type { OrderDTO } from '@remnant/shared'
import type { OrderDB } from '@/types'

export function mapOrderToDTO(order: OrderDB): OrderDTO {
  return {
    id: order._id,
    seq: order.seq,
    warehouse: order.warehouse,
    deliveryService: order.deliveryService,
    orderSource: order.orderSource,
    orderStatus: order.orderStatus,
    orderPayments: order.orderPayments,
    totals: order.totals,
    client: order.client,
    comment: order.comment,
    createdBy: order.createdBy,
    confirmedBy: order.confirmedBy,
    removedBy: order.removedBy,
    removed: order.removed,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}
