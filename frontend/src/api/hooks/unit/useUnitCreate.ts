import type { CreateUnitRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createUnit } from '@/api/requests'

export function useUnitCreate(settings?: MutationSettings<CreateUnitRequest>) {
  return useMutation({
    mutationFn: createUnit,
    ...settings?.options,
  })
}
