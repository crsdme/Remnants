import type { CreateMoneyTransactionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createMoneyTransaction } from '@/api/requests'

export function useMoneyTransactionCreate(settings?: MutationSettings<CreateMoneyTransactionRequest>) {
  return useMutation({
    mutationFn: createMoneyTransaction,
    ...settings?.options,
  })
}
