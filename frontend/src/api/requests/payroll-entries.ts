import type {
  CreatePayrollEntryRequest,
  CreatePayrollEntryResponse,
  RemovePayrollEntriesRequest,
  RemovePayrollEntriesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function createPayrollEntry(params: CreatePayrollEntryRequest) {
  return api.post<CreatePayrollEntryResponse>('payroll-entries/create', params)
}

export async function removePayrollEntries(params: RemovePayrollEntriesRequest) {
  return api.post<RemovePayrollEntriesResponse>('payroll-entries/remove', params)
}
