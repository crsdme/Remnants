import type { WarehouseTransactionDTO, WarehouseTransactionItemDTO } from '@remnant/shared'
import type { WarehouseTransactionDBPopulated, WarehouseTransactionItemDBPopulated } from '@/types/'
import { mapProductPopulatedRepoToDTO } from './products.mapper'

export function mapWarehouseTransactionToDTO(warehouseTransaction: WarehouseTransactionDBPopulated): WarehouseTransactionDTO {
  return {
    id: warehouseTransaction.id,
    seq: warehouseTransaction.seq,
    type: warehouseTransaction.type,
    fromWarehouse: warehouseTransaction.fromWarehouse !== undefined
      ? {
          id: warehouseTransaction.fromWarehouse.id,
          names: warehouseTransaction.fromWarehouse.names,
        }
      : undefined,
    toWarehouse: warehouseTransaction.toWarehouse !== undefined
      ? {
          id: warehouseTransaction.toWarehouse.id,
          names: warehouseTransaction.toWarehouse.names,
        }
      : undefined,
    requiresReceiving: warehouseTransaction.requiresReceiving ?? true,
    sourceModel: warehouseTransaction.sourceModel,
    sourceId: warehouseTransaction.sourceId,
    status: warehouseTransaction.status,
    accepted: warehouseTransaction.accepted ?? false,
    acceptedBy: warehouseTransaction.acceptedBy,
    removedAt: warehouseTransaction.removedAt,
    removedBy: warehouseTransaction.removedBy,
    acceptedAt: warehouseTransaction.acceptedAt,
    comment: warehouseTransaction.comment ?? '',
    createdBy: warehouseTransaction.createdBy,
    createdAt: warehouseTransaction.createdAt,
    updatedAt: warehouseTransaction.updatedAt,
  }
}

export function mapWarehouseTransactionItemRepoToDTO(warehouseTransactionItem: WarehouseTransactionItemDBPopulated): WarehouseTransactionItemDTO {
  return {
    id: String(warehouseTransactionItem._id),
    transactionId: warehouseTransactionItem.transactionId,
    productId: String(warehouseTransactionItem.productId ?? ''),
    product: mapProductPopulatedRepoToDTO(warehouseTransactionItem.product),
    quantity: warehouseTransactionItem.quantity,
    receivedQuantity: warehouseTransactionItem.receivedQuantity ?? 0,
    price: warehouseTransactionItem.price ?? 0,
  }
}
