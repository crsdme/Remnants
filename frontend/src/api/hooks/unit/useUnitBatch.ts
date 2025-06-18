import type { batchUnitParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { batchUnit } from '@/api/requests'

export function useUnitBatch(settings?: MutationSettings<batchUnitParams, typeof batchUnit>) {
  return useMutation({
    mutationFn: batchUnit,
    ...settings?.options,
  })
}
