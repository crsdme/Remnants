import type { CreateExpenseRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createExpense } from '@/api/requests/expense'

export function useExpenseCreate(settings?: MutationSettings<CreateExpenseRequest>) {
  return useMutation({
    mutationFn: createExpense,
    ...settings?.options,
  })
}
