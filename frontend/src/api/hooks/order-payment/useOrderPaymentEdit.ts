import type { EditOrderPaymentRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editOrderPayment } from '@/api/requests'

export function useOrderPaymentEdit(settings?: MutationSettings<EditOrderPaymentRequest>) {
  return useMutation({
    mutationFn: editOrderPayment,
    ...settings?.options,
  })
}
