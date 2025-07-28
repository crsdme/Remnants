import type { editExpenseCategoryParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editExpenseCategory } from '@/api/requests/expense-categories'

export function useExpenseCategoryEdit(settings?: MutationSettings<editExpenseCategoryParams, typeof editExpenseCategory>) {
  return useMutation({
    mutationFn: editExpenseCategory,
    ...settings?.options,
  })
}
