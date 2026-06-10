import type { CreateProductPropertyGroupRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createProductPropertyGroups } from '@/api/requests'

export function useProductPropertyGroupCreate(settings?: MutationSettings<CreateProductPropertyGroupRequest>) {
  return useMutation({
    mutationFn: createProductPropertyGroups,
    ...settings?.options,
  })
}
