import type { WarehouseTransactionDTO, WarehouseTransactionItemDTO } from '@remnant/shared'
import type { WarehouseTransactionDBPopulated, WarehouseTransactionItemDBPopulated } from '@/types/'
import { mapProductPopulatedRepoToDTO } from './products.mapper'

export function mapWarehouseTransactionToDTO(warehouseTransaction: WarehouseTransactionDBPopulated): WarehouseTransactionDTO {
  return {
    id: warehouseTransaction._id,
    seq: warehouseTransaction.seq,
    type: warehouseTransaction.type,
    fromWarehouse: {
      id: warehouseTransaction.fromWarehouse.id,
      names: warehouseTransaction.fromWarehouse.names,
    },
    toWarehouse: {
      id: warehouseTransaction.toWarehouse.id,
      names: warehouseTransaction.toWarehouse.names,
    },
    requiresReceiving: warehouseTransaction.requiresReceiving,
    status: warehouseTransaction.status,
    accepted: warehouseTransaction.accepted,
    acceptedBy: warehouseTransaction.acceptedBy,
    removedAt: warehouseTransaction.removedAt,
    removedBy: warehouseTransaction.removedBy,
    acceptedAt: warehouseTransaction.acceptedAt,
    comment: warehouseTransaction.comment,
    createdBy: warehouseTransaction.createdBy,
    createdAt: warehouseTransaction.createdAt,
    updatedAt: warehouseTransaction.updatedAt,
  }
}

export function mapWarehouseTransactionItemRepoToDTO(warehouseTransactionItem: WarehouseTransactionItemDBPopulated): WarehouseTransactionItemDTO {
  return {
    id: warehouseTransactionItem._id,
    transactionId: warehouseTransactionItem.transactionId,
    productId: warehouseTransactionItem.productId,
    product: mapProductPopulatedRepoToDTO(warehouseTransactionItem.product),
    quantity: warehouseTransactionItem.quantity,
    price: warehouseTransactionItem.price,
  }
}
