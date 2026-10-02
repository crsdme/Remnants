import type { CancelProcurementPaymentRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { cancelProcurementPayment } from '@/api/requests'

export function useProcurementPayCancel(settings?: MutationSettings<CancelProcurementPaymentRequest, typeof cancelProcurementPayment>) {
  return useMutation({
    mutationFn: cancelProcurementPayment,
    ...settings?.options,
  })
}
