import type {
  createWarehouseTransactionLogsSchema,
  WarehouseTransactionLogDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { warehouseTransactionLogDBSchema } from '../schemas'
import {
  getWarehouseTransactionLogsSchema,
} from '@remnant/shared'

export type WarehouseTransactionLogDB = z.infer<typeof warehouseTransactionLogDBSchema>

export type GetWarehouseTransactionLogsPayload = z.output<typeof getWarehouseTransactionLogsSchema>
export function parseGetWarehouseTransactionLogs(x: unknown): GetWarehouseTransactionLogsPayload {
  return getWarehouseTransactionLogsSchema.parse(x)
}

export type CreateWarehouseTransactionLogsPayload = z.output<typeof createWarehouseTransactionLogsSchema>

export interface GetWarehouseTransactionLogsRepoResult { items: WarehouseTransactionLogDTO[], total: number, page: number, pageSize: number }
