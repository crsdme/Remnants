import type { duplicateUnitParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { duplicateUnit } from '@/api/requests'

export function useDuplicateUnits(settings?: MutationSettings<duplicateUnitParams, typeof duplicateUnit>) {
  return useMutation({
    mutationFn: (params: duplicateUnitParams) => duplicateUnit(params),
    ...settings?.options,
  })
}
