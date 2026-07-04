import type { ExpensePopulatedDTO } from '@remnant/shared'
import type { ExpenseDBPopulated } from '@/types'
import { fromMinor } from '@/utils/'

export function mapExpenseToDTO(expense: ExpenseDBPopulated): ExpensePopulatedDTO {
  return {
    id: expense._id,
    seq: expense.seq,
    amount: Number.parseFloat(fromMinor(expense.minorAmount, expense.currency.scale)),
    currency: {
      id: expense.currency.id,
      names: expense.currency.names,
      symbols: expense.currency.symbols,
      scale: expense.currency.scale,
    },
    cashregister: {
      id: expense.cashregister.id,
      names: expense.cashregister.names,
    },
    cashregisterAccount: {
      id: expense.cashregisterAccount.id,
      names: expense.cashregisterAccount.names,
    },
    categories: expense.categories.map(category => ({
      id: category.id,
      names: category.names,
    })),
    sourceModel: expense.sourceModel,
    sourceId: expense.sourceId,
    type: expense.type,
    comment: expense.comment,
    createdBy: expense.createdBy,
    removedBy: expense.removedBy,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  }
}
