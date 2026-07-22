import type { CashregisterAccountDTO } from '@remnant/shared'
import type { z } from 'zod'
import type {
  cashregisterAccountDBPopulatedSchema,
  cashregisterAccountDBSchema,
} from '../schemas'
import {
  createCashregisterAccountSchema,
  editCashregisterAccountSchema,
  getCashregisterAccountsSchema,
  removeCashregisterAccountsSchema,
} from '@remnant/shared'

export type CashregisterAccountDB = z.infer<typeof cashregisterAccountDBSchema>

export type CashregisterAccountDBPopulated = z.infer<typeof cashregisterAccountDBPopulatedSchema>

export type GetCashregisterAccountsPayload = z.output<typeof getCashregisterAccountsSchema>
export function parseGetCashregisterAccounts(x: unknown): GetCashregisterAccountsPayload {
  return getCashregisterAccountsSchema.parse(x)
}

export type CreateCashregisterAccountPayload = z.output<typeof createCashregisterAccountSchema>
export function parseCreateCashregisterAccount(x: unknown): CreateCashregisterAccountPayload {
  return createCashregisterAccountSchema.parse(x)
}

export type EditCashregisterAccountPayload = z.output<typeof editCashregisterAccountSchema>
export function parseEditCashregisterAccount(x: unknown): EditCashregisterAccountPayload {
  return editCashregisterAccountSchema.parse(x)
}

export type RemoveCashregisterAccountsPayload = z.output<typeof removeCashregisterAccountsSchema>
export function parseRemoveCashregisterAccounts(x: unknown): RemoveCashregisterAccountsPayload {
  return removeCashregisterAccountsSchema.parse(x)
}

export type GetCashregisterAccountsRepoPayload = GetCashregisterAccountsPayload
export interface GetCashregisterAccountsRepoResult { items: CashregisterAccountDTO[], total: number, page: number, pageSize: number }

export type CreateCashregisterAccountsRepoPayload = CreateCashregisterAccountPayload

export type EditCashregisterAccountsRepoPayload = EditCashregisterAccountPayload
