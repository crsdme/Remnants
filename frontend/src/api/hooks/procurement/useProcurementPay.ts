import type { PayProcurementRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { payProcurement } from '@/api/requests'

export function useProcurementPay(settings?: MutationSettings<PayProcurementRequest, typeof payProcurement>) {
  return useMutation({
    mutationFn: payProcurement,
    ...settings?.options,
  })
}
