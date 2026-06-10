import type { CreateMoneyTransactionTransferRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createMoneyTransfer } from '@/api/requests'

export function useMoneyTransferCreate(settings?: MutationSettings<CreateMoneyTransactionTransferRequest>) {
  return useMutation({
    mutationFn: createMoneyTransfer,
    ...settings?.options,
  })
}
