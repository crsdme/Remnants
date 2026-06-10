import type { EditExpenseCategoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editExpenseCategory } from '@/api/requests/'

export function useExpenseCategoryEdit(settings?: MutationSettings<EditExpenseCategoryRequest>) {
  return useMutation({
    mutationFn: editExpenseCategory,
    ...settings?.options,
  })
}
