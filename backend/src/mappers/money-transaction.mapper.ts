import type { MoneyTransactionDTO } from '@remnant/shared'
import type { MoneyTransactionPopulated } from '@/types'
import { toMinorType } from '@remnant/shared'
import { fromMinor } from '@/utils/money'

function mapActor(actor: MoneyTransactionPopulated['createdBy']): MoneyTransactionDTO['createdBy'] {
  if (!actor || typeof actor === 'string' || !actor.id)
    return null

  return {
    id: actor.id,
    name: actor.name ?? '',
  }
}

function mapMajorAmount(minor: number | null | undefined, scale: number): number | null {
  if (minor == null || Number.isNaN(Number(minor)))
    return null

  return Number.parseFloat(fromMinor(toMinorType(minor), scale))
}

export function mapMoneyTransactionToDTO(moneyTransaction: MoneyTransactionPopulated): MoneyTransactionDTO {
  const scale = moneyTransaction.currency.scale

  return {
    id: moneyTransaction.id,
    seq: moneyTransaction.seq,
    type: moneyTransaction.type,
    direction: moneyTransaction.direction,
    account: moneyTransaction.account,
    amount: Number.parseFloat(fromMinor(moneyTransaction.minorAmount, scale)),
    balanceBefore: mapMajorAmount(moneyTransaction.minorBalanceBefore, scale),
    balanceAfter: mapMajorAmount(moneyTransaction.minorBalanceAfter, scale),
    confirmed: moneyTransaction.confirmed !== false && moneyTransaction.cancelled !== true,
    cancelled: moneyTransaction.cancelled === true,
    awaitingReceive: moneyTransaction.awaitingReceive === true,
    role: moneyTransaction.role === 'from' || moneyTransaction.role === 'to' ? moneyTransaction.role : null,
    transferId: moneyTransaction.transferId,
    currency: {
      id: moneyTransaction.currency.id,
      names: moneyTransaction.currency.names,
      symbols: moneyTransaction.currency.symbols,
      scale,
    },
    cashregister: moneyTransaction.cashregister,
    description: moneyTransaction.description,
    sourceModel: moneyTransaction.sourceModel,
    sourceId: moneyTransaction.sourceId,
    createdBy: mapActor(moneyTransaction.createdBy),
    confirmedBy: mapActor(moneyTransaction.confirmedBy),
    cancelledBy: mapActor(moneyTransaction.cancelledBy),
    confirmedAt: moneyTransaction.confirmedAt ?? null,
    cancelledAt: moneyTransaction.cancelledAt ?? null,
    createdAt: moneyTransaction.createdAt,
    updatedAt: moneyTransaction.updatedAt,
  }
}
