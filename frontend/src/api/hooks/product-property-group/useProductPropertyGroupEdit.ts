import type { EditProductPropertyGroupRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editProductPropertyGroups } from '@/api/requests'

export function useProductPropertyGroupEdit(settings?: MutationSettings<EditProductPropertyGroupRequest>) {
  return useMutation({
    mutationFn: editProductPropertyGroups,
    ...settings?.options,
  })
}
