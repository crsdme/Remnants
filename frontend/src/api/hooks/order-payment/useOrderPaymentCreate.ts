import type { createOrderPaymentParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createOrderPayment } from '@/api/requests'

export function useOrderPaymentCreate(settings?: MutationSettings<createOrderPaymentParams, typeof createOrderPayment>) {
  return useMutation({
    mutationFn: createOrderPayment,
    ...settings?.options,
  })
}
