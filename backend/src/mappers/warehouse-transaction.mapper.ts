import type { WarehouseTransactionDTO } from '@remnant/shared'
import type { WarehouseTransactionDB } from '@/types/'

export function mapWarehouseTransactionToDTO(warehouseTransaction: WarehouseTransactionDB): WarehouseTransactionDTO {
  return {
    id: warehouseTransaction._id,
    seq: warehouseTransaction.seq,
    type: warehouseTransaction.type,
    fromWarehouse: warehouseTransaction.fromWarehouse,
    toWarehouse: warehouseTransaction.toWarehouse,
    requiresReceiving: warehouseTransaction.requiresReceiving,
    status: warehouseTransaction.status,
    accepted: warehouseTransaction.accepted,
    acceptedBy: warehouseTransaction.acceptedBy,
    removedAt: warehouseTransaction.removedAt,
    acceptedAt: warehouseTransaction.acceptedAt,
    comment: warehouseTransaction.comment,
    createdBy: warehouseTransaction.createdBy,
    createdAt: warehouseTransaction.createdAt,
    updatedAt: warehouseTransaction.updatedAt,
  }
}
