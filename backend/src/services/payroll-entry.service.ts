import type {
  CreatePayrollEntryResponse,
  RemovePayrollEntriesResponse,
} from '@remnant/shared'
import type {
  CreatePayrollEntryPayload,
  RemovePayrollEntriesPayload,
} from '@/types'
import { mapPayrollEntryToDTO } from '@/mappers'
import * as PayrollEntryRepo from '@/repositories/payroll-entry.repo'
import * as UsersRepo from '@/repositories/users.repo'
import { HttpError } from '@/utils/'
import { assertCanEditProfile } from './user-profile.service'

export async function create({
  payload,
  user,
}: {
  payload: CreatePayrollEntryPayload
  user: { id: string, permissions?: string[] }
}): Promise<CreatePayrollEntryResponse> {
  assertCanEditProfile(user)

  const target = await UsersRepo.findById(payload.userId)
  if (!target)
    throw new HttpError(404, 'User not found', 'USER_NOT_FOUND')

  const entry = await PayrollEntryRepo.createOne({
    userId: payload.userId,
    type: 'adjustment',
    workDate: payload.workDate,
    minorAmount: Number(payload.minorAmount) || 0,
    currencyId: payload.currencyId,
    comment: payload.comment ?? '',
    createdBy: user.id,
  })

  return {
    status: 'success',
    code: 'PAYROLL_ENTRY_CREATED',
    message: 'Payroll entry created',
    data: mapPayrollEntryToDTO(entry),
  }
}

export async function remove({
  payload,
  user,
}: {
  payload: RemovePayrollEntriesPayload
  user: { id: string, permissions?: string[] }
}): Promise<RemovePayrollEntriesResponse> {
  assertCanEditProfile(user)
  await PayrollEntryRepo.removeByIds(payload.ids)
  return {
    status: 'success',
    code: 'PAYROLL_ENTRIES_REMOVED',
    message: 'Payroll entries removed',
  }
}
