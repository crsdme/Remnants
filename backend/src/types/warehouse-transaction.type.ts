import type {
  createWarehouseTransactionItemsSchema,
  getWarehouseTransactionDetailsSchema,
  ProductDTO,
  WarehouseTransactionDTO,

  WarehouseTransactionItemDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type {
  createWarehouseTransactionItemsRepoSchema,
  editWarehouseTransactionItemRepoSchema,
  editWarehouseTransactionRepoSchema,
  warehouseTransactionDBSchema,
  warehouseTransactionItemDBSchema,
} from '@/schemas'
import {
  createWarehouseTransactionSchema,
  editWarehouseTransactionSchema,
  getWarehouseTransactionsItemsSchema,
  getWarehouseTransactionsSchema,
  receiveWarehouseTransactionSchema,
  removeWarehouseTransactionsSchema,
  scanBarcodeToDraftSchema,
} from '@remnant/shared'

export type WarehouseTransactionDB = z.infer<typeof warehouseTransactionDBSchema>

export type WarehouseTransactionItemDB = z.infer<typeof warehouseTransactionItemDBSchema>

export type GetWarehouseTransactionsPayload = z.output<typeof getWarehouseTransactionsSchema>
export function parseGetWarehouseTransactions(x: unknown): GetWarehouseTransactionsPayload {
  return getWarehouseTransactionsSchema.parse(x)
}

export type ScanBarcodeToDraftPayload = z.output<typeof scanBarcodeToDraftSchema>
export function parseScanBarcodeToDraft(x: unknown): ScanBarcodeToDraftPayload {
  return scanBarcodeToDraftSchema.parse(x)
}

export type GetWarehouseTransactionDetailsPayload = z.output<typeof getWarehouseTransactionDetailsSchema>

export type GetWarehouseTransactionsItemsPayload = z.output<typeof getWarehouseTransactionsItemsSchema>
export function parseGetWarehouseTransactionsItems(x: unknown): GetWarehouseTransactionsItemsPayload {
  return getWarehouseTransactionsItemsSchema.parse(x)
}

export type CreateWarehouseTransactionPayload = z.output<typeof createWarehouseTransactionSchema>
export function parseCreateWarehouseTransaction(x: unknown): CreateWarehouseTransactionPayload {
  return createWarehouseTransactionSchema.parse(x)
}

export type EditWarehouseTransactionPayload = z.output<typeof editWarehouseTransactionSchema>
export function parseEditWarehouseTransaction(x: unknown): EditWarehouseTransactionPayload {
  return editWarehouseTransactionSchema.parse(x)
}

export type RemoveWarehouseTransactionsPayload = z.output<typeof removeWarehouseTransactionsSchema>
export function parseRemoveWarehouseTransactions(x: unknown): RemoveWarehouseTransactionsPayload {
  return removeWarehouseTransactionsSchema.parse(x)
}

export type ReceiveWarehouseTransactionPayload = z.output<typeof receiveWarehouseTransactionSchema>
export function parseReceiveWarehouseTransaction(x: unknown): ReceiveWarehouseTransactionPayload {
  return receiveWarehouseTransactionSchema.parse(x)
}

export type CreateWarehouseTransactionItemsPayload = z.output<typeof createWarehouseTransactionItemsSchema>

export type GetWarehouseTransactionsRepoPayload = GetWarehouseTransactionsPayload
export interface GetWarehouseTransactionsRepoResult { items: WarehouseTransactionDTO[], total: number, page: number, pageSize: number }

export type GetWarehouseTransactionsItemsRepoPayload = GetWarehouseTransactionsItemsPayload
export interface GetWarehouseTransactionsItemsRepoResult { items: (WarehouseTransactionItemDTO & { product: ProductDTO })[], total: number, page: number, pageSize: number }

export type CreateWarehouseTransactionRepoPayload = CreateWarehouseTransactionPayload

export type CreateWarehouseTransactionItemsRepoPayload = z.output<typeof createWarehouseTransactionItemsRepoSchema>

export type EditWarehouseTransactionRepoPayload = z.output<typeof editWarehouseTransactionRepoSchema>

export type EditWarehouseTransactionItemRepoPayload = z.output<typeof editWarehouseTransactionItemRepoSchema>
