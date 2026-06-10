import type { QuantityDTO } from '@remnant/shared'
import type { QuantityDB } from '@/types/'

export function mapQuantityToDTO(quantity: QuantityDB): QuantityDTO {
  return {
    id: quantity._id,
    count: quantity.count,
    productId: quantity.productId,
    warehouse: quantity.warehouse,
    status: quantity.status,
    createdAt: quantity.createdAt,
    updatedAt: quantity.updatedAt,
  }
}
