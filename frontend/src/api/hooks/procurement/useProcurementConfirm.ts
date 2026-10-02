import type { ConfirmProcurementRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { confirmProcurement } from '@/api/requests'

export function useProcurementConfirm(settings?: MutationSettings<ConfirmProcurementRequest, typeof confirmProcurement>) {
  return useMutation({
    mutationFn: confirmProcurement,
    ...settings?.options,
  })
}
