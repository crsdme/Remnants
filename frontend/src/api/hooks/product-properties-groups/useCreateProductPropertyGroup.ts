import type { createProductPropertiesGroupsParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createProductPropertiesGroups } from '@/api/requests'

export function useCreateProductPropertyGroup(settings?: MutationSettings<createProductPropertiesGroupsParams, typeof createProductPropertiesGroups>) {
  return useMutation({
    mutationFn: (params: createProductPropertiesGroupsParams) => createProductPropertiesGroups(params),
    ...settings?.options,
  })
}
