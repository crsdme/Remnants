import type { removeProcurementsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeProcurement } from '@/api/requests'

export function useProcurementRemove(settings?: MutationSettings<removeProcurementsParams, typeof removeProcurement>) {
  return useMutation({
    mutationFn: removeProcurement,
    ...settings?.options,
  })
}
