import type { batchUnitParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { batchUnit } from '@/api/requests'

export function useBatchUnit(settings?: MutationSettings<batchUnitParams, typeof batchUnit>) {
  return useMutation({
    mutationFn: (params: batchUnitParams) => batchUnit(params),
    ...settings?.options,
  })
}
