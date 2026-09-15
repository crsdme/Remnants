import type { z } from 'zod'
import type { payrollEntryDBSchema } from '../schemas'
import {
  createPayrollEntrySchema,
  getPayrollEntriesSchema,
  removePayrollEntriesSchema,
} from '@remnant/shared'

export type PayrollEntryDB = z.infer<typeof payrollEntryDBSchema>

export type GetPayrollEntriesPayload = z.output<typeof getPayrollEntriesSchema>
export function parseGetPayrollEntries(x: unknown): GetPayrollEntriesPayload {
  return getPayrollEntriesSchema.parse(x)
}

export type CreatePayrollEntryPayload = z.output<typeof createPayrollEntrySchema>
export function parseCreatePayrollEntry(x: unknown): CreatePayrollEntryPayload {
  return createPayrollEntrySchema.parse(x)
}

export type RemovePayrollEntriesPayload = z.output<typeof removePayrollEntriesSchema>
export function parseRemovePayrollEntries(x: unknown): RemovePayrollEntriesPayload {
  return removePayrollEntriesSchema.parse(x)
}

export interface GetPayrollEntriesRepoResult {
  items: PayrollEntryDB[]
  total: number
  page: number
  pageSize: number
}
