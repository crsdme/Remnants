import type { createUnitsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createUnit } from '@/api/requests'

export function useUnitCreate(settings?: MutationSettings<createUnitsParams, typeof createUnit>) {
  return useMutation({
    mutationFn: createUnit,
    ...settings?.options,
  })
}
