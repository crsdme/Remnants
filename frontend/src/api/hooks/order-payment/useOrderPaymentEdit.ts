import type { editOrderPaymentParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editOrderPayment } from '@/api/requests'

export function useOrderPaymentEdit(settings?: MutationSettings<editOrderPaymentParams, typeof editOrderPayment>) {
  return useMutation({
    mutationFn: editOrderPayment,
    ...settings?.options,
  })
}
