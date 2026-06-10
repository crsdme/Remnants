import type { RemoveUnitRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeUnit } from '@/api/requests'

export function useUnitRemove(settings?: MutationSettings<RemoveUnitRequest>) {
  return useMutation({
    mutationFn: removeUnit,
    ...settings?.options,
  })
}
