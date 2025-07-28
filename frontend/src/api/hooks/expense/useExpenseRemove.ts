import type { removeExpensesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeExpense } from '@/api/requests/expense'

export function useExpenseRemove(settings?: MutationSettings<removeExpensesParams, typeof removeExpense>) {
  return useMutation({
    mutationFn: removeExpense,
    ...settings?.options,
  })
}
