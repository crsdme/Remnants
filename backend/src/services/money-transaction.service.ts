import type {
  AuthUser,
  CancelMoneyTransactionResponse,
  CreateMoneyTransactionResponse,
  CreateMoneyTransactionTransferResponse,
  GetMoneyTransactionsResponse,
  ReceiveMoneyTransactionResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CancelMoneyTransactionPayload,
  CreateMoneyTransactionsPayload,
  CreateMoneyTransactionTransferPayload,
  GetMoneyTransactionsPayload,
  ReceiveMoneyTransactionPayload,
} from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { mapMoneyTransactionToDTO } from '@/mappers'
import * as CurrencyRepo from '@/repositories/currencies.repo'
import * as MoneyTransactionRepo from '@/repositories/money-transaction.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import {
  assertAccountCapability,
  assertEntityInAccess,
  getAccountIdsWithCapabilityForUser,
  getEntityIdsWithCapabilityForUser,
  hasAccountCapability,
} from '@/utils'
import { HttpError } from '@/utils/httpError'
import { toMinor } from '@/utils/money'

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
      cashregisterIds: getEntityIdsWithCapabilityForUser(access, 'cashregisters', 'viewHistory', user),
      cashregisterAccountIds: getAccountIdsWithCapabilityForUser(access, 'viewHistory', user),
    },
  })

  const mappedItems = items.map(mapMoneyTransactionToDTO)

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

async function snapshotForLeg({
  accountId,
  currencyId,
  direction,
  minorAmount,
  affectsBalance,
  session,
}: {
  accountId: string
  currencyId: string
  direction: 'in' | 'out'
  minorAmount: number
  affectsBalance: boolean
  session?: ClientSession
}) {
  const minorBalanceBefore = await MoneyTransactionRepo.getAccountCurrencyMinorBalance({
    accountId,
    currencyId,
    session,
  })
  const delta = direction === 'in' ? minorAmount : -minorAmount

  return {
    minorBalanceBefore,
    minorBalanceAfter: affectsBalance ? minorBalanceBefore + delta : minorBalanceBefore,
  }
}

export async function createTransaction({ payload, session, user }: { payload: CreateMoneyTransactionsPayload, session?: ClientSession, user?: AuthUser }): Promise<CreateMoneyTransactionResponse> {
  if (user) {
    const access = await UserAccessRepo.getScopesByUserId(user.id)
    const isAdmin = user.permissions.includes('other.admin')
    const capability = payload.direction === 'out' ? 'transfer' : 'receive'
    assertAccountCapability(access, payload.accountId, capability, { isAdmin })
  }

  const currency = await CurrencyRepo.findOne({ _id: payload.currencyId })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const minorAmount = toMinor(payload.amount, currency.scale)
  const snapshot = await snapshotForLeg({
    accountId: payload.accountId,
    currencyId: payload.currencyId,
    direction: payload.direction,
    minorAmount,
    affectsBalance: true,
    session,
  })

  const created = await MoneyTransactionRepo.createOne({
    payload: {
      type: payload.type,
      direction: payload.direction,
      accountId: payload.accountId,
      cashregisterId: payload.cashregisterId,
      sourceModel: payload.sourceModel,
      sourceId: payload.sourceId,
      currencyId: payload.currencyId,
      minorAmount,
      description: payload.description,
      transferId: payload.transferId,
      confirmed: true,
      confirmedBy: user?.id ?? null,
      confirmedAt: new Date(),
      createdBy: user?.id ?? null,
      cancelled: false,
      ...snapshot,
    },
    session,
  })

  if (created.length === 0)
    throw new HttpError(400, 'Money transaction not created', 'MONEY_TRANSACTION_NOT_CREATED')

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: await getCreatedDto(created[0]._id.toString(), session),
  }
}

export async function createTransfer({
  payload,
  session,
  user,
}: {
  payload: CreateMoneyTransactionTransferPayload
  session?: ClientSession
  user: AuthUser
}): Promise<CreateMoneyTransactionTransferResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')

  assertAccountCapability(access, payload.accountFrom, 'transfer', { isAdmin })
  assertEntityInAccess(access, 'cashregisters', payload.cashregisterTo, { isAdmin })

  const requiresReceiving = payload.requiresReceiving ?? payload.type === 'transfer-cashregister'
  const confirmedAt = new Date()
  const transferId = uuidv4()

  const currency = await CurrencyRepo.findOne({ _id: payload.currencyId })

  if (currency === null)
    throw new HttpError(400, 'Currency not found', 'CURRENCY_NOT_FOUND')

  const minorAmount = toMinor(payload.amount, currency.scale)

  const outSnapshot = await snapshotForLeg({
    accountId: payload.accountFrom,
    currencyId: payload.currencyId,
    direction: 'out',
    minorAmount,
    affectsBalance: true,
    session,
  })

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
      minorAmount,
      description: payload.description,
      transferId,
      confirmed: true,
      confirmedBy: user.id,
      confirmedAt,
      createdBy: user.id,
      cancelled: false,
      ...outSnapshot,
    },
    session,
  })

  const inSnapshot = await snapshotForLeg({
    accountId: payload.accountTo,
    currencyId: payload.currencyId,
    direction: 'in',
    minorAmount,
    affectsBalance: !requiresReceiving,
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
      minorAmount,
      description: payload.description,
      transferId,
      confirmed: !requiresReceiving,
      confirmedBy: requiresReceiving ? null : user.id,
      confirmedAt: requiresReceiving ? null : confirmedAt,
      createdBy: user.id,
      cancelled: false,
      ...inSnapshot,
    },
    session,
  })

  if (transferOut.length === 0 || transferIn.length === 0)
    throw new HttpError(400, 'Money transaction not created', 'MONEY_TRANSACTION_NOT_CREATED')

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CREATED',
    message: 'Money transaction created',
    data: {
      transferOut: await getCreatedDto(transferOut[0]._id.toString(), session),
      transferIn: await getCreatedDto(transferIn[0]._id.toString(), session),
    },
  }
}

export async function receive({
  payload,
  session,
  user,
}: {
  payload: ReceiveMoneyTransactionPayload
  session?: ClientSession
  user: AuthUser
}): Promise<ReceiveMoneyTransactionResponse> {
  const legs = await MoneyTransactionRepo.findByTransferId({ transferId: payload.transferId, session })
  const incoming = legs.find(leg => leg.role === 'to')

  if (!incoming)
    throw new HttpError(404, 'Money transfer not found', 'MONEY_TRANSACTION_NOT_FOUND')

  if (incoming.type !== 'transfer')
    throw new HttpError(400, 'Money transaction is not a transfer', 'MONEY_TRANSACTION_NOT_TRANSFER')

  if (incoming.cancelled)
    throw new HttpError(400, 'Money transfer already cancelled', 'MONEY_TRANSACTION_ALREADY_CANCELLED')

  if (incoming.confirmed)
    throw new HttpError(400, 'Money transfer already received', 'MONEY_TRANSACTION_ALREADY_RECEIVED')

  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')
  assertAccountCapability(access, incoming.accountId, 'receive', { isAdmin })

  const snapshot = await snapshotForLeg({
    accountId: incoming.accountId,
    currencyId: incoming.currencyId,
    direction: incoming.direction,
    minorAmount: incoming.minorAmount,
    affectsBalance: true,
    session,
  })

  const updated = await MoneyTransactionRepo.updateById({
    id: incoming._id.toString(),
    payload: {
      confirmed: true,
      confirmedBy: user.id,
      confirmedAt: new Date(),
      ...snapshot,
    },
    session,
  })

  if (!updated)
    throw new HttpError(400, 'Money transfer not received', 'MONEY_TRANSACTION_NOT_RECEIVED')

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_RECEIVED',
    message: 'Money transfer received',
    data: await getCreatedDto(updated._id.toString(), session),
  }
}

export async function cancel({
  payload,
  session,
  user,
}: {
  payload: CancelMoneyTransactionPayload
  session?: ClientSession
  user: AuthUser
}): Promise<CancelMoneyTransactionResponse> {
  const legs = await MoneyTransactionRepo.findByTransferId({ transferId: payload.transferId, session })
  const incoming = legs.find(leg => leg.role === 'to')
  const outgoing = legs.find(leg => leg.role === 'from')

  if (!incoming)
    throw new HttpError(404, 'Money transfer not found', 'MONEY_TRANSACTION_NOT_FOUND')

  if (incoming.type !== 'transfer')
    throw new HttpError(400, 'Money transaction is not a transfer', 'MONEY_TRANSACTION_NOT_TRANSFER')

  if (incoming.cancelled || outgoing?.cancelled)
    throw new HttpError(400, 'Money transfer already cancelled', 'MONEY_TRANSACTION_ALREADY_CANCELLED')

  if (incoming.confirmed)
    throw new HttpError(400, 'Money transfer already received', 'MONEY_TRANSACTION_ALREADY_RECEIVED')

  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const isAdmin = user.permissions.includes('other.admin')
  const canCancel = hasAccountCapability(access, incoming.accountId, 'receive', { isAdmin })
    || (outgoing != null && hasAccountCapability(access, outgoing.accountId, 'transfer', { isAdmin }))

  if (!canCancel)
    throw new HttpError(403, 'Access to resource denied', 'SCOPE_DENIED')

  const cancelledAt = new Date()
  const cancelPayload = {
    cancelled: true,
    cancelledBy: user.id,
    cancelledAt,
  }

  const updatedIncoming = await MoneyTransactionRepo.updateById({
    id: incoming._id.toString(),
    payload: cancelPayload,
    session,
  })

  if (!updatedIncoming)
    throw new HttpError(400, 'Money transfer not cancelled', 'MONEY_TRANSACTION_NOT_CANCELLED')

  if (outgoing) {
    const updatedOutgoing = await MoneyTransactionRepo.updateById({
      id: outgoing._id.toString(),
      payload: cancelPayload,
      session,
    })

    if (!updatedOutgoing)
      throw new HttpError(400, 'Money transfer not cancelled', 'MONEY_TRANSACTION_NOT_CANCELLED')
  }

  return {
    status: 'success',
    code: 'MONEY_TRANSACTION_CANCELLED',
    message: 'Money transfer cancelled',
    data: {
      transferOut: outgoing
        ? await getCreatedDto(outgoing._id.toString(), session)
        : null,
      transferIn: await getCreatedDto(incoming._id.toString(), session),
    },
  }
}

async function getCreatedDto(id: string, session?: ClientSession) {
  const populated = await MoneyTransactionRepo.getById({ id, session })

  if (!populated)
    throw new HttpError(400, 'Money transaction not found', 'MONEY_TRANSACTION_NOT_CREATED')

  return mapMoneyTransactionToDTO(populated)
}
