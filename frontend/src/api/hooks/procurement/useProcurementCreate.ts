import type { createProcurementsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createProcurement } from '@/api/requests'

export function useProcurementCreate(settings?: MutationSettings<createProcurementsParams, typeof createProcurement>) {
  return useMutation({
    mutationFn: createProcurement,
    ...settings?.options,
  })
}
