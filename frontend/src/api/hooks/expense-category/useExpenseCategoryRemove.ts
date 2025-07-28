import type { removeExpenseCategoriesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeExpenseCategory } from '@/api/requests/expense-categories'

export function useExpenseCategoryRemove(settings?: MutationSettings<removeExpenseCategoriesParams, typeof removeExpenseCategory>) {
  return useMutation({
    mutationFn: removeExpenseCategory,
    ...settings?.options,
  })
}
