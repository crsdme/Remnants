import type { duplicateUnitParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { duplicateUnit } from '@/api/requests'

export function useUnitDuplicate(settings?: MutationSettings<duplicateUnitParams, typeof duplicateUnit>) {
  return useMutation({
    mutationFn: duplicateUnit,
    ...settings?.options,
  })
}
