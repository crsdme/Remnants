import type { removeUnitParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeUnit } from '@/api/requests'

export function useRemoveUnits(settings?: MutationSettings<removeUnitParams, typeof removeUnit>) {
  return useMutation({
    mutationFn: (params: removeUnitParams) => removeUnit(params),
    ...settings?.options,
  })
}
