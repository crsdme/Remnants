import type { removeUnitParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeUnit } from '@/api/requests'

export function useUnitRemove(settings?: MutationSettings<removeUnitParams, typeof removeUnit>) {
  return useMutation({
    mutationFn: removeUnit,
    ...settings?.options,
  })
}
