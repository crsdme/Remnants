import type { CashregisterDTO } from '@remnant/shared'
import type { z } from 'zod'
import type {
  cashregisterDBPopulatedSchema,
  cashregisterDBSchema,
} from '../schemas'
import {
  createCashregisterSchema,
  editCashregisterSchema,
  getCashregistersSchema,
  removeCashregistersSchema,
} from '@remnant/shared'

export type CashregisterDB = z.infer<typeof cashregisterDBSchema>

export type CashregisterDBPopulated = z.infer<typeof cashregisterDBPopulatedSchema>

export type GetCashregistersPayload = z.output<typeof getCashregistersSchema>
export function parseGetCashregisters(x: unknown): GetCashregistersPayload {
  return getCashregistersSchema.parse(x)
}

export type CreateCashregisterPayload = z.output<typeof createCashregisterSchema>
export function parseCreateCashregister(x: unknown): CreateCashregisterPayload {
  return createCashregisterSchema.parse(x)
}

export type EditCashregisterPayload = z.output<typeof editCashregisterSchema>
export function parseEditCashregister(x: unknown): EditCashregisterPayload {
  return editCashregisterSchema.parse(x)
}

export type RemoveCashregistersPayload = z.output<typeof removeCashregistersSchema>
export function parseRemoveCashregisters(x: unknown): RemoveCashregistersPayload {
  return removeCashregistersSchema.parse(x)
}

export type GetCashregistersRepoPayload = GetCashregistersPayload
export interface GetCashregistersRepoResult { items: CashregisterDTO[], total: number, page: number, pageSize: number }

export type CreateCashregistersRepoPayload = CreateCashregisterPayload

export type EditCashregistersRepoPayload = EditCashregisterPayload
