import type { editExpenseParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editExpense } from '@/api/requests/expense'

export function useExpenseEdit(settings?: MutationSettings<editExpenseParams, typeof editExpense>) {
  return useMutation({
    mutationFn: editExpense,
    ...settings?.options,
  })
}
