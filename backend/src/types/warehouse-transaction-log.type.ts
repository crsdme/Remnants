import type {
  createWarehouseTransactionLogsSchema,
  WarehouseTransactionLogDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  getWarehouseTransactionLogsSchema,
} from '@remnant/shared'

export interface WarehouseTransactionLogDB {
  _id: string
  productId: string
  warehouseId: string
  deltaCount: number
  refType: string
  refId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export type GetWarehouseTransactionLogsPayload = z.output<typeof getWarehouseTransactionLogsSchema>
export function parseGetWarehouseTransactionLogs(x: unknown): GetWarehouseTransactionLogsPayload {
  return getWarehouseTransactionLogsSchema.parse(x)
}

export type CreateWarehouseTransactionLogsPayload = z.output<typeof createWarehouseTransactionLogsSchema>

export interface GetWarehouseTransactionLogsRepoResult { items: WarehouseTransactionLogDTO[], total: number, page: number, pageSize: number }

// export type EditUnitPayload = z.output<typeof editUnitSchema>
// export function parseEditUnit(x: unknown): EditUnitPayload {
//   return editUnitSchema.parse(x)
// }

// export type RemoveUnitsPayload = z.output<typeof removeUnitSchema>
// export function parseRemoveUnits(x: unknown): RemoveUnitsPayload {
//   return removeUnitSchema.parse(x)
// }

// export type GetUnitsRepoPayload = GetUnitsPayload
// export interface GetUnitsRepoResult { items: UnitDTO[], total: number, page: number, pageSize: number }

// export type CreateUnitRepoPayload = CreateUnitPayload

// export type EditUnitRepoPayload = EditUnitPayload
