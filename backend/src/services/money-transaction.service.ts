import type {
  AuthUser,
  CreateMoneyTransactionResponse,
  CreateMoneyTransactionTransferResponse,
  GetMoneyTransactionsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CreateMoneyTransactionsPayload,
  CreateMoneyTransactionTransferPayload,
  GetMoneyTransactionsPayload,
} from '@/types'
import { v4 as uuidv4 } from 'uuid'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as MoneyTransactionRepo from '@/repositories/money-transaction.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import { getScopeIdsForUser } from '@/utils'
import { HttpError } from '@/utils/httpError'
import { fromMinor, toMinor } from '@/utils/money'

export async function get({
  payload,
  user,
}: {
  payload: GetMoneyTransactionsPayload
  user: AuthUser
}): Promise<GetMoneyTransactionsResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)

  const { items, total, page, pageSize } = await MoneyTransactionRepo.list({
    payload,
    options: {
      cashregisterIds: getScopeIdsForUser(access, 'cashregisterIds', user),
      cashregisterAccountIds: getScopeIdsForUser(access, 'cashregisterAccountIds', user),
    },
  })

  const mappedItems = items.map(item => ({
    ...item,
    amount: Number.parseFloat(fromMinor(item.minorAmount, item.currency.scale)),
  }))

  return {
    status: 'success',
    code: 'MONEY_TRANSACTIONS_FETCHED',
    message: 'Money transactions fetched',
    data: {
      items: mappedItems,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function createTransaction({ payload, session }: { payload: CreateMoneyTransactionsPayload, session?: ClientSession }): Promise<CreateMoneyTransactionResponse> {
  const currency = await CurrencyRepo.findOne({ _id: payload.currencyId })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const moneyTransaction = await MoneyTransactionRepo.createOne({
    payload: {
      type: payload.type,
      direction: payload.direction,
      accountId: payload.accountId,
      cashregisterId: payload.cashregisterId,
      sourceModel: payload.sourceModel,
      sourceId: payload.sourceId,
      currencyId: payload.currencyId,
      minorAmount: toMinor(payload.amount, currency.scale),
      description: payload.description,
      transferId: payload.transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: moneyTransaction[0],
  }
}

export async function createTransfer({ payload, session }: { payload: CreateMoneyTransactionTransferPayload, session?: ClientSession }): Promise<CreateMoneyTransactionTransferResponse> {
  const transferId = uuidv4()

  const currency = await CurrencyRepo.findOne({ _id: payload.currencyId })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const transferOut = await MoneyTransactionRepo.createOne({
    payload: {
      type: 'transfer',
      direction: 'out',
      role: 'from',
      accountId: payload.accountFrom,
      cashregisterId: payload.cashregisterFrom,
      sourceModel: payload.sourceModel,
      sourceId: payload.accountFrom,
      currencyId: payload.currencyId,
      minorAmount: toMinor(payload.amount, currency.scale),
      description: payload.description,
      transferId,
    },
    session,
  })

  const transferIn = await MoneyTransactionRepo.createOne({
    payload: {
      type: 'transfer',
      direction: 'in',
      role: 'to',
      accountId: payload.accountTo,
      cashregisterId: payload.cashregisterTo,
      sourceModel: payload.sourceModel,
      sourceId: payload.accountTo,
      currencyId: payload.currencyId,
      minorAmount: toMinor(payload.amount, currency.scale),
      description: payload.description,
      transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: {
      transferOut: transferOut[0],
      transferIn: transferIn[0],
    },
  }
}
