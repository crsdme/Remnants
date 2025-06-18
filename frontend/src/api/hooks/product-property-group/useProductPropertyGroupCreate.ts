import type { createProductPropertiesGroupsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createProductPropertiesGroups } from '@/api/requests'

export function useProductPropertyGroupCreate(settings?: MutationSettings<createProductPropertiesGroupsParams, typeof createProductPropertiesGroups>) {
  return useMutation({
    mutationFn: createProductPropertiesGroups,
    ...settings?.options,
  })
}
