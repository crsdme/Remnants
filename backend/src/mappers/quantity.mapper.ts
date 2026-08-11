import type { QuantityDTO } from '@remnant/shared'
import type { QuantityDB } from '@/types/'

export function mapQuantityToDTO(quantity: QuantityDB): QuantityDTO {
  return {
    id: quantity._id,
    count: quantity.count,
    productId: quantity.productId,
    warehouseId: quantity.warehouseId,
    status: quantity.status ?? (quantity.count > 0 ? 'available' : quantity.count === 0 ? 'sold' : 'reserved'),
    stockStatusId: quantity.stockStatusId ?? null,
    lastSaleAt: quantity.lastSaleAt ?? null,
    createdAt: quantity.createdAt,
    updatedAt: quantity.updatedAt,
  }
}
