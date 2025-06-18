import type { editProductPropertiesGroupsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editProductPropertiesGroups } from '@/api/requests'

export function useProductPropertyGroupEdit(settings?: MutationSettings<editProductPropertiesGroupsParams, typeof editProductPropertiesGroups>) {
  return useMutation({
    mutationFn: editProductPropertiesGroups,
    ...settings?.options,
  })
}
