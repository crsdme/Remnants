import type { payProcurementParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { payProcurement } from '@/api/requests'

export function useProcurementPay(settings?: MutationSettings<payProcurementParams, typeof payProcurement>) {
  return useMutation({
    mutationFn: payProcurement,
    ...settings?.options,
  })
}
