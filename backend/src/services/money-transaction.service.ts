import type {
  CreateMoneyTransactionResponse,
  CreateMoneyTransactionTransferResponse,
  GetMoneyTransactionsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type { CreateMoneyTransactionsPayload, CreateMoneyTransactionTransferPayload, GetMoneyTransactionsPayload } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { mapMoneyTransactionToDTO } from '@/mappers'
import * as MoneyTransactionRepo from '@/repositories/money-transaction.repo'

export async function get({ payload }: { payload: GetMoneyTransactionsPayload }): Promise<GetMoneyTransactionsResponse> {
  const { items, total, page, pageSize } = await MoneyTransactionRepo.list({ payload })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTIONS_FETCHED',
    message: 'Money transactions fetched',
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

export async function createTransaction({ payload, session }: { payload: CreateMoneyTransactionsPayload, session?: ClientSession }): Promise<CreateMoneyTransactionResponse> {
  const moneyTransaction = await MoneyTransactionRepo.createOne({
    payload: {
      type: payload.type,
      direction: payload.direction,
      accountId: payload.account,
      cashregisterId: payload.cashregister,
      sourceModel: payload.sourceModel,
      sourceId: payload.sourceId,
      currencyId: payload.currency,
      amount: payload.amount,
      description: payload.description,
      transferId: payload.transferId,
    },
    session,
  })

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: mapMoneyTransactionToDTO(moneyTransaction[0]),
  }
}

export async function createTransfer({ payload, session }: { payload: CreateMoneyTransactionTransferPayload, session?: ClientSession }): Promise<CreateMoneyTransactionTransferResponse> {
  const transferId = uuidv4()

  const transferOut = await MoneyTransactionRepo.createOne({
    payload: {
      type: 'transfer',
      direction: 'out',
      role: 'from',
      accountId: payload.accountFrom,
      cashregisterId: payload.cashregisterFrom,
      sourceModel: payload.sourceModel,
      sourceId: payload.accountFrom,
      currencyId: payload.currency,
      amount: payload.amount,
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
      currencyId: payload.currency,
      amount: payload.amount,
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
      transferOut: mapMoneyTransactionToDTO(transferOut[0]),
      transferIn: mapMoneyTransactionToDTO(transferIn[0]),
    },
  }
}

// async function createTransferAccount({ payload, session }: { payload: PayloadByType<'transfer-account'>, session?: ClientSession }): Promise<CreateMoneyTransactionTransferResponse> {
//   const transferId = uuidv4()

//   const transferOut = await MoneyTransactionRepo.createOne({
//     payload: {
//       type: 'transfer',
//       direction: 'out',
//       role: 'from',
//       accountId: payload.accountFrom,
//       cashregisterId: payload.cashregister,
//       sourceModel: payload.sourceModel,
//       sourceId: payload.accountFrom,
//       currency: payload.currency,
//       amount: payload.amount,
//       description: payload.description,
//       transferId,
//     },
//     session,
//   })

//   const transferIn = await MoneyTransactionRepo.createOne({
//     payload: {
//       type: 'transfer',
//       direction: 'in',
//       role: 'to',
//       accountId: payload.accountTo,
//       cashregisterId: payload.cashregister,
//       sourceModel: payload.sourceModel,
//       sourceId: payload.accountTo,
//       currency: payload.currency,
//       amount: payload.amount,
//       description: payload.description,
//       transferId,
//     },
//     session,
//   })

//   return {
//     status: 'success',
//     code: 'MONEY_TRANSACTION_CREATED',
//     message: 'Money transaction created',
//     data: {
//       transferOut: mapMoneyTransactionToDTO(transferOut[0]),
//       transferIn: mapMoneyTransactionToDTO(transferIn[0]),
//     },
//   }
// }

// async function createTransferCashregister({ payload, session }: { payload: PayloadByType<'transfer-cashregister'>, session?: ClientSession }): Promise<CreateMoneyTransactionTransferResponse> {
//   const transferId = uuidv4()

//   const transferOut = await MoneyTransactionRepo.createOne({
//     payload: {
//       type: 'transfer',
//       direction: 'out',
//       role: 'from',
//       accountId: payload.accountFrom,
//       cashregisterId: payload.cashregisterFrom,
//       sourceModel: payload.sourceModel,
//       sourceId: payload.accountFrom,
//       currency: payload.currency,
//       amount: payload.amount,
//       description: payload.description,
//       transferId,
//     },
//     session,
//   })

//   const transferIn = await MoneyTransactionRepo.createOne({
//     payload: {
//       type: 'transfer',
//       direction: 'in',
//       role: 'to',
//       accountId: payload.accountTo,
//       cashregisterId: payload.cashregisterTo,
//       sourceModel: payload.sourceModel,
//       sourceId: payload.accountTo,
//       currency: payload.currency,
//       amount: payload.amount,
//       description: payload.description,
//       transferId,
//     },
//     session,
//   })

//   return {
//     status: 'success',
//     code: 'MONEY_TRANSACTION_CREATED',
//     message: 'Money transaction created',
//     data: {
//       transferOut: mapMoneyTransactionToDTO(transferOut[0]),
//       transferIn: mapMoneyTransactionToDTO(transferIn[0]),
//     },
//   }
// }
