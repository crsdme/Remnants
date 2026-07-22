import type { MoneyTransactionDTO } from '@remnant/shared'
import type { MoneyTransactionDB } from '@/types'

export function mapMoneyTransactionToDTO(moneyTransaction: MoneyTransactionDB): MoneyTransactionDTO {
  return {
    id: moneyTransaction.id,
    seq: moneyTransaction.seq,
    type: moneyTransaction.type,
    direction: moneyTransaction.direction,
    account: moneyTransaction.account,
    amount: moneyTransaction.amount,
    confirmed: moneyTransaction.confirmed,
    currency: {
      id: moneyTransaction.currency.id,
      names: moneyTransaction.currency.names,
      symbols: moneyTransaction.currency.symbols,
      scale: moneyTransaction.currency.scale,
    },
    cashregister: moneyTransaction.cashregister,
    description: moneyTransaction.description,
    sourceModel: moneyTransaction.sourceModel,
    sourceId: moneyTransaction.sourceId,
    createdBy: moneyTransaction.createdBy,
    removedBy: moneyTransaction.removedBy,
    createdAt: moneyTransaction.createdAt,
    updatedAt: moneyTransaction.updatedAt,
  }
}
