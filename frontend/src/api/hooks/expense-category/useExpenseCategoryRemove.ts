import type { RemoveExpenseCategoriesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeExpenseCategory } from '@/api/requests/'

export function useExpenseCategoryRemove(settings?: MutationSettings<RemoveExpenseCategoriesRequest>) {
  return useMutation({
    mutationFn: removeExpenseCategory,
    ...settings?.options,
  })
}
