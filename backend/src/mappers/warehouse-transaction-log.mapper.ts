import type { WarehouseTransactionLogDTO } from '@remnant/shared'
import type { WarehouseTransactionLogDB } from '@/types/'

export function mapWarehouseTransactionLogRepoToDTO(warehouseTransactionLog: WarehouseTransactionLogDB): WarehouseTransactionLogDTO {
  return {
    id: warehouseTransactionLog._id,
    productId: warehouseTransactionLog.productId,
    warehouseId: warehouseTransactionLog.warehouseId,
    deltaCount: warehouseTransactionLog.deltaCount,
    refType: warehouseTransactionLog.refType,
    refId: warehouseTransactionLog.refId,
    userId: warehouseTransactionLog.userId,
    createdAt: warehouseTransactionLog.createdAt,
    updatedAt: warehouseTransactionLog.updatedAt,
  }
}
