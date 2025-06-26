import type { removeMoneyTransactionsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeMoneyTransaction } from '@/api/requests'

export function useMoneyTransactionRemove(settings?: MutationSettings<removeMoneyTransactionsParams, typeof removeMoneyTransaction>) {
  return useMutation({
    mutationFn: removeMoneyTransaction,
    ...settings?.options,
  })
}
