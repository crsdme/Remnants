import type { CreateProcurementRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createProcurement } from '@/api/requests'

export function useProcurementCreate(settings?: MutationSettings<CreateProcurementRequest, typeof createProcurement>) {
  return useMutation({
    mutationFn: createProcurement,
    ...settings?.options,
  })
}
