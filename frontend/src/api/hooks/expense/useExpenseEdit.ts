import type { EditExpenseRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editExpense } from '@/api/requests/expense'

export function useExpenseEdit(settings?: MutationSettings<EditExpenseRequest>) {
  return useMutation({
    mutationFn: editExpense,
    ...settings?.options,
  })
}
