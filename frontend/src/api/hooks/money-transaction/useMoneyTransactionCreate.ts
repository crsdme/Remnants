import type { createMoneyTransactionsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createMoneyTransaction } from '@/api/requests'

export function useMoneyTransactionCreate(settings?: MutationSettings<createMoneyTransactionsParams, typeof createMoneyTransaction>) {
  return useMutation({
    mutationFn: createMoneyTransaction,
    ...settings?.options,
  })
}
