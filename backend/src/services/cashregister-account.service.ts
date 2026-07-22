import type {
  AuthUser,
  CreateCashregisterAccountResponse,
  EditCashregisterAccountResponse,
  GetCashregisterAccountsResponse,
  RemoveCashregisterAccountsResponse,
} from '@remnant/shared'
import type {
  CreateCashregisterAccountPayload,
  EditCashregisterAccountPayload,
  GetCashregisterAccountsPayload,
  RemoveCashregisterAccountsPayload,
} from '@/types'
import { mapCashregisterAccountToDTO } from '@/mappers/cashregister-accounts.mapper'
import * as cashregisterAccountsRepo from '@/repositories/cashregister-accounts.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { getScopeIdsForUser, HttpError } from '@/utils/'

export async function get({
  payload,
  user,
}: {
  payload: GetCashregisterAccountsPayload
  user: AuthUser
}): Promise<GetCashregisterAccountsResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getScopeIdsForUser(access, 'cashregisterAccounts', user)

  const { items, total, page, pageSize } = await cashregisterAccountsRepo.list(payload, { scopeIds })

  return {
    status: 'success',
    code: 'CASHREGISTER_ACCOUNTS_FETCHED',
    message: 'Cashregister accounts fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateCashregisterAccountPayload }): Promise<CreateCashregisterAccountResponse> {
  const raw = await cashregisterAccountsRepo.createOne(payload)

  return {
    status: 'success',
    code: 'CASHREGISTER_ACCOUNT_CREATED',
    message: 'Cashregister account created',
    data: mapCashregisterAccountToDTO(raw),
  }
}

export async function edit({ payload }: { payload: EditCashregisterAccountPayload }): Promise<EditCashregisterAccountResponse> {
  const { id } = payload

  const data = await cashregisterAccountsRepo.updateById(id, payload)

  if (!data) {
    throw new HttpError(400, 'Cashregister account not edited', 'CASHREGISTER_ACCOUNT_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'CASHREGISTER_ACCOUNT_EDITED',
    message: 'Cashregister account edited',
    data: mapCashregisterAccountToDTO(data),
  }
}

export async function remove({ payload }: { payload: RemoveCashregisterAccountsPayload }): Promise<RemoveCashregisterAccountsResponse> {
  for (const id of payload.ids) {
    const data = await cashregisterAccountsRepo.removeById(id)

    if (!data)
      continue

    await AuditLogsService.create({
      resourceType: 'cashregister-account',
      resourceId: id.toString(),
      action: 'remove',
      changes: [
        { path: 'names', before: data.names, after: null },
        { path: 'currencies', before: data.currencies, after: null },
        { path: 'priority', before: data.priority, after: null },
        { path: 'active', before: data.active, after: null },
        { path: 'removed', before: false, after: true },
      ],
    })
  }

  return {
    status: 'success',
    code: 'CASHREGISTER_ACCOUNTS_REMOVED',
    message: 'Cashregister accounts removed',
  }
}
