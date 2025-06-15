import type { removeProductPropertiesGroupsParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeProductPropertiesGroups } from '@/api/requests'

export function useRemoveProductPropertyGroup(settings?: MutationSettings<removeProductPropertiesGroupsParams, typeof removeProductPropertiesGroups>) {
  return useMutation({
    mutationFn: (params: removeProductPropertiesGroupsParams) => removeProductPropertiesGroups(params),
    ...settings?.options,
  })
}
