import type { removeOrderPaymentsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeOrderPayment } from '@/api/requests'

export function useOrderPaymentRemove(settings?: MutationSettings<removeOrderPaymentsParams, typeof removeOrderPayment>) {
  return useMutation({
    mutationFn: removeOrderPayment,
    ...settings?.options,
  })
}
