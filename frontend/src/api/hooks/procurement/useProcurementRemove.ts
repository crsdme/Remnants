import type { RemoveProcurementsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeProcurement } from '@/api/requests'

export function useProcurementRemove(settings?: MutationSettings<RemoveProcurementsRequest, typeof removeProcurement>) {
  return useMutation({
    mutationFn: removeProcurement,
    ...settings?.options,
  })
}
