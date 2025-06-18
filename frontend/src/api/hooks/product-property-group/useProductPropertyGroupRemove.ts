import type { removeProductPropertiesGroupsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeProductPropertiesGroups } from '@/api/requests'

export function useProductPropertyGroupRemove(settings?: MutationSettings<removeProductPropertiesGroupsParams, typeof removeProductPropertiesGroups>) {
  return useMutation({
    mutationFn: removeProductPropertiesGroups,
    ...settings?.options,
  })
}
