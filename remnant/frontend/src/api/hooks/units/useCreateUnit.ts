import type { createUnitsParams } from '@/api/requests'

import { createUnit } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useCreateUnit(settings?: MutationSettings<createUnitsParams, typeof createUnit>) {
  return useMutation({
    mutationFn: (params: createUnitsParams) => createUnit(params),
    ...settings?.options,
  })
}
