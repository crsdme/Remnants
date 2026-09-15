import type { ReceiveMoneyTransactionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { receiveMoneyTransfer } from '@/api/requests'

export function useMoneyTransferReceive(settings?: MutationSettings<ReceiveMoneyTransactionRequest>) {
  return useMutation({
    mutationFn: receiveMoneyTransfer,
    ...settings?.options,
  })
}
