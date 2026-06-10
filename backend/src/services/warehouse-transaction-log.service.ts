import type {
  CreateWarehouseTransactionLogsResponse,
  GetWarehouseTransactionLogsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CreateWarehouseTransactionLogsPayload,
  GetWarehouseTransactionLogsPayload,
} from '@/types/'
import { mapWarehouseTransactionLogToDTO } from '@/mappers/'
import * as WarehouseTransactionLogRepo from '@/repositories/warehouse-transaction-log.repo'

export async function get({ payload }: { payload: GetWarehouseTransactionLogsPayload }): Promise<GetWarehouseTransactionLogsResponse> {
  const { items, total, page, pageSize } = await WarehouseTransactionLogRepo.list(payload)

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_LOGS_FETCHED',
    message: 'Warehouse transaction logs fetched',
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}

export async function create(payload: CreateWarehouseTransactionLogsPayload, session?: ClientSession): Promise<CreateWarehouseTransactionLogsResponse> {
  const warehouseTransactionLog = await WarehouseTransactionLogRepo.createOne({ payload, session })

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_LOG_CREATED',
    message: 'Warehouse transaction log created',
    data: mapWarehouseTransactionLogToDTO(warehouseTransactionLog[0]),
  }
}
