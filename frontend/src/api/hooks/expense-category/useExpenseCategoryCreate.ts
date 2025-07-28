import type { createExpenseCategoryParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createExpenseCategory } from '@/api/requests/expense-categories'

export function useExpenseCategoryCreate(settings?: MutationSettings<createExpenseCategoryParams, typeof createExpenseCategory>) {
  return useMutation({
    mutationFn: createExpenseCategory,
    ...settings?.options,
  })
}
