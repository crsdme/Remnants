import type { ExpenseDTO } from '@remnant/shared'
import type { ExpenseDB } from '@/types'

export function mapExpenseToDTO(expense: ExpenseDB): ExpenseDTO {
  return {
    id: expense._id,
    seq: expense.seq,
    amount: expense.amount,
    currency: expense.currency,
    cashregister: expense.cashregister,
    cashregisterAccount: expense.cashregisterAccount,
    categories: expense.categories,
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
