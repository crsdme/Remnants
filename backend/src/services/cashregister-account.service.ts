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
import { CashregisterAccountModel } from '@/models'
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
  const scopeIds = getScopeIdsForUser(access, 'cashregisterAccountIds', user)

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

export async function create({ payload, user }: { payload: CreateCashregisterAccountPayload, user?: AuthUser }): Promise<CreateCashregisterAccountResponse> {
  const raw = await cashregisterAccountsRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'cashregister-account',
    resourceId: raw._id.toString(),
    action: 'create',
    before: null,
    after: raw,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'CASHREGISTER_ACCOUNT_CREATED',
    message: 'Cashregister account created',
    data: mapCashregisterAccountToDTO(raw),
  }
}

export async function edit({ payload, user }: { payload: EditCashregisterAccountPayload, user?: AuthUser }): Promise<EditCashregisterAccountResponse> {
  const { id } = payload

  const before = await CashregisterAccountModel.findById(id).exec()
  const data = await cashregisterAccountsRepo.updateById(id, payload)

  if (!data) {
    throw new HttpError(400, 'Cashregister account not edited', 'CASHREGISTER_ACCOUNT_NOT_EDITED')
  }

  await AuditLogsService.record({
    resourceType: 'cashregister-account',
    resourceId: data._id.toString(),
    action: 'edit',
    before,
    after: data,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'CASHREGISTER_ACCOUNT_EDITED',
    message: 'Cashregister account edited',
    data: mapCashregisterAccountToDTO(data),
  }
}

export async function remove({ payload, user }: { payload: RemoveCashregisterAccountsPayload, user?: AuthUser }): Promise<RemoveCashregisterAccountsResponse> {
  for (const id of payload.ids) {
    const data = await cashregisterAccountsRepo.removeById(id)

    if (!data)
      continue

    await AuditLogsService.record({
      resourceType: 'cashregister-account',
      resourceId: id,
      action: 'remove',
      before: data,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'CASHREGISTER_ACCOUNTS_REMOVED',
    message: 'Cashregister accounts removed',
  }
}
