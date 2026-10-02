import type { PaySupplierRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { paySupplier } from '@/api/requests'

export function useSupplierPay(settings?: MutationSettings<PaySupplierRequest, typeof paySupplier>) {
  return useMutation({
    mutationFn: paySupplier,
    ...settings?.options,
  })
}
