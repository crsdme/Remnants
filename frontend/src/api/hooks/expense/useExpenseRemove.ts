import type { RemoveExpensesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeExpense } from '@/api/requests/expense'

export function useExpenseRemove(settings?: MutationSettings<RemoveExpensesRequest>) {
  return useMutation({
    mutationFn: removeExpense,
    ...settings?.options,
  })
}
