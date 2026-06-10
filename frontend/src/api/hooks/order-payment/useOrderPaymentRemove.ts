import type { RemoveOrderPaymentsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeOrderPayment } from '@/api/requests'

export function useOrderPaymentRemove(settings?: MutationSettings<RemoveOrderPaymentsRequest>) {
  return useMutation({
    mutationFn: removeOrderPayment,
    ...settings?.options,
  })
}
