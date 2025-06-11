import type { editProductPropertiesGroupsParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editProductPropertiesGroups } from '@/api/requests'

export function useEditProductPropertyGroup(settings?: MutationSettings<editProductPropertiesGroupsParams, typeof editProductPropertiesGroups>) {
  return useMutation({
    mutationFn: (params: editProductPropertiesGroupsParams) => editProductPropertiesGroups(params),
    ...settings?.options,
  })
}
