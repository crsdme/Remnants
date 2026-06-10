import type { CreateExpenseCategoryRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createExpenseCategory } from '@/api/requests/'

export function useExpenseCategoryCreate(settings?: MutationSettings<CreateExpenseCategoryRequest>) {
  return useMutation({
    mutationFn: createExpenseCategory,
    ...settings?.options,
  })
}
