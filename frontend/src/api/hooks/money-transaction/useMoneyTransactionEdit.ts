import type { editMoneyTransactionsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editMoneyTransaction } from '@/api/requests'

export function useMoneyTransactionEdit(settings?: MutationSettings<editMoneyTransactionsParams, typeof editMoneyTransaction>) {
  return useMutation({
    mutationFn: editMoneyTransaction,
    ...settings?.options,
  })
}
