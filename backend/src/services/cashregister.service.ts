import type {
  AuthUser,
  CreateCashregisterResponse,
  EditCashregisterResponse,
  GetCashregistersResponse,
  RemoveCashregistersResponse,
} from '@remnant/shared'
import type {
  CreateCashregisterPayload,
  EditCashregisterPayload,
  GetCashregistersPayload,
  RemoveCashregistersPayload,
} from '@/types'
import { accountHasCapability } from '@remnant/shared'
import { mapCashregisterToDTO } from '@/mappers/'
import * as cashregisterRepo from '@/repositories/cashregisters.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import { getEntityIdsForUser, HttpError } from '@/utils/'

export async function get({
  payload,
  user,
}: {
  payload: GetCashregistersPayload
  user: AuthUser
}): Promise<GetCashregistersResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getEntityIdsForUser(access, 'cashregisters', user)
  const isAdmin = user.permissions.includes('other.admin')

  const { items, total, page, pageSize } = await cashregisterRepo.list(payload, { scopeIds })

  const maskedItems = items.map((item) => {
    if (isAdmin)
      return item

    return {
      ...item,
      accounts: item.accounts
        .filter((account) => {
          const entry = access.cashregisters.find(cr => cr.id === item.id)
          return entry?.accounts.some(a => a.id === account.id) ?? false
        })
        .map(account => ({
          ...account,
          currencies: accountHasCapability(access.cashregisters, account.id, 'viewBalance')
            ? account.currencies
            : [],
        })),
    }
  })

  return {
    status: 'success',
    code: 'CASHREGISTERS_FETCHED',
    message: 'Cashregisters fetched',
    data: {
      items: maskedItems,
      pagination: { page, pageSize, total },
    },
  }
}

export async function create({ payload }: { payload: CreateCashregisterPayload }): Promise<CreateCashregisterResponse> {
  const cashregister = await cashregisterRepo.createOne(payload)

  if (cashregister === undefined)
    throw new HttpError(400, 'Cashregister not created', 'CASHREGISTER_NOT_CREATED')

  return {
    status: 'success',
    code: 'CASHREGISTER_CREATED',
    message: 'Cashregister created',
    data: mapCashregisterToDTO(cashregister),
  }
}

export async function edit({ payload }: { payload: EditCashregisterPayload }): Promise<EditCashregisterResponse> {
  const cashregister = await cashregisterRepo.updateById(payload.id, payload)

  if (!cashregister) {
    throw new HttpError(400, 'Cashregister not edited', 'CASHREGISTER_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'CASHREGISTER_EDITED',
    message: 'Cashregister edited',
    data: mapCashregisterToDTO(cashregister),
  }
}

export async function remove({ payload }: { payload: RemoveCashregistersPayload }): Promise<RemoveCashregistersResponse> {
  for (const id of payload.ids) {
    const cashregisters = await cashregisterRepo.removeById(id)

    if (!cashregisters)
      continue
  }

  return {
    status: 'success',
    code: 'CASHREGISTERS_REMOVED',
    message: 'Cashregisters removed',
  }
}
