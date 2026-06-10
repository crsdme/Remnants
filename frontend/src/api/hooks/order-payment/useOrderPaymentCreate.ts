import type { CreateOrderPaymentRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createOrderPayment } from '@/api/requests'

export function useOrderPaymentCreate(settings?: MutationSettings<CreateOrderPaymentRequest>) {
  return useMutation({
    mutationFn: createOrderPayment,
    ...settings?.options,
  })
}
