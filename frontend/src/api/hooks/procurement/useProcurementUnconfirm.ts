import type { UnconfirmProcurementRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { unconfirmProcurement } from '@/api/requests'

export function useProcurementUnconfirm(settings?: MutationSettings<UnconfirmProcurementRequest, typeof unconfirmProcurement>) {
  return useMutation({
    mutationFn: unconfirmProcurement,
    ...settings?.options,
  })
}
