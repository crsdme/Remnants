import type { createExpenseParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createExpense } from '@/api/requests/expense'

export function useExpenseCreate(settings?: MutationSettings<createExpenseParams, typeof createExpense>) {
  return useMutation({
    mutationFn: createExpense,
    ...settings?.options,
  })
}
