import type { ExpenseCategoryDTO } from '@remnant/shared'
import type { ExpenseCategoryDB } from '@/types'

export function mapExpenseCategoryToDTO(expenseCategory: ExpenseCategoryDB): ExpenseCategoryDTO {
  return {
    id: expenseCategory._id,
    names: expenseCategory.names,
    color: expenseCategory.color,
    comment: expenseCategory.comment,
    priority: expenseCategory.priority,
    createdAt: expenseCategory.createdAt,
    updatedAt: expenseCategory.updatedAt,
  }
}
