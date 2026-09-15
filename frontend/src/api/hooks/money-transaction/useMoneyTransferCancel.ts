import type { CancelMoneyTransactionRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { cancelMoneyTransfer } from '@/api/requests'

export function useMoneyTransferCancel(settings?: MutationSettings<CancelMoneyTransactionRequest>) {
  return useMutation({
    mutationFn: cancelMoneyTransfer,
    ...settings?.options,
  })
}
