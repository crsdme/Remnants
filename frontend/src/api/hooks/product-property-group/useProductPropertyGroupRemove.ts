import type { RemoveProductPropertyGroupRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeProductPropertyGroups } from '@/api/requests'

export function useProductPropertyGroupRemove(settings?: MutationSettings<RemoveProductPropertyGroupRequest>) {
  return useMutation({
    mutationFn: removeProductPropertyGroups,
    ...settings?.options,
  })
}
