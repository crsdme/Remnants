import type {
  AuthUser,
  CreateClientResponse,
  EditClientResponse,
  GetClientsResponse,
  PayClientResponse,
  RemoveClientsResponse,
} from '@remnant/shared'
import type {
  CreateClientPayload,
  EditClientPayload,
  GetClientsPayload,
  PayClientPayload,
  RemoveClientsPayload,
} from '@/types'
import { mapClientToDTO } from '@/mappers/'
import * as ClientRepo from '@/repositories/client.repo'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as MoneyTransactionService from '@/services/money-transaction.service'
import * as Settlement from '@/services/settlement.service'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetClientsPayload }): Promise<GetClientsResponse> {
  const { items, total, page, pageSize } = await ClientRepo.list(payload)
  const withSettlement = await Settlement.withClientSettlement(items)

  return {
    status: 'success',
    code: 'CLIENTS_FETCHED',
    message: 'Clients fetched',
    data: {
      items: withSettlement,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateClientPayload }): Promise<CreateClientResponse> {
  const client = await ClientRepo.createOne(payload)
  const [item] = await Settlement.withClientSettlement([mapClientToDTO(client)])

  return {
    status: 'success',
    code: 'CLIENT_CREATED',
    message: 'Client created',
    data: item,
  }
}

export async function edit({ payload }: { payload: EditClientPayload }): Promise<EditClientResponse> {
  const client = await ClientRepo.updateById(payload.id, payload)

  if (!client) {
    throw new HttpError(400, 'Client not edited', 'CLIENT_NOT_EDITED')
  }

  const [item] = await Settlement.withClientSettlement([mapClientToDTO(client)])

  return {
    status: 'success',
    code: 'CLIENT_EDITED',
    message: 'Client edited',
    data: item,
  }
}

export async function remove({ payload }: { payload: RemoveClientsPayload }): Promise<RemoveClientsResponse> {
  const { ids } = payload

  for (const id of ids) {
    const client = await ClientRepo.removeById(id)

    if (!client)
      continue
  }

  return {
    status: 'success',
    code: 'CLIENTS_REMOVED',
    message: 'Clients removed',
  }
}

export async function pay({
  payload,
  user,
}: {
  payload: PayClientPayload
  user: AuthUser
}): Promise<PayClientResponse> {
  const client = await ClientRepo.findById(payload.clientId)
  if (client === null)
    throw new HttpError(404, 'Client not found', 'CLIENT_NOT_FOUND')

  const currency = await CurrencyRepo.findOne({ _id: payload.currency })
  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  if (payload.amount !== undefined) {
    if (payload.cashregister == null || payload.cashregister === ''
      || payload.account == null || payload.account === '') {
      throw new HttpError(400, 'Cashregister and account are required', 'CLIENT_PAYMENT_ACCOUNT_REQUIRED')
    }

    await MoneyTransactionService.createTransaction({
      payload: {
        type: 'income',
        direction: 'in',
        accountId: payload.account,
        cashregisterId: payload.cashregister,
        sourceModel: 'client',
        sourceId: payload.clientId,
        currencyId: payload.currency,
        amount: payload.amount,
        description: payload.comment,
      },
      user,
    })
  }
  else {
    await Settlement.allocateClientCreditFifo(payload.clientId, payload.currency)
  }

  const [item] = await Settlement.withClientSettlement([mapClientToDTO(client)])

  return {
    status: 'success',
    code: 'CLIENT_PAID',
    message: 'Client paid',
    data: item,
  }
}
