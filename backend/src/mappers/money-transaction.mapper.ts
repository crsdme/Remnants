import type { MoneyTransactionDTO } from '@remnant/shared'
import type { MoneyTransactionDB } from '@/types'

export function mapMoneyTransactionToDTO(moneyTransaction: MoneyTransactionDB): MoneyTransactionDTO {
  return {
    id: moneyTransaction._id,
    seq: moneyTransaction.seq,
    type: moneyTransaction.type,
    direction: moneyTransaction.direction,
    account: moneyTransaction.account,
    minorAmount: moneyTransaction.minorAmount,
    currency: moneyTransaction.currency,
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
