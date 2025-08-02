import type { editSitesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editSite } from '@/api/requests'

export function useSiteEdit(settings?: MutationSettings<editSitesParams, typeof editSite>) {
  return useMutation({
    mutationFn: editSite,
    ...settings?.options,
  })
}
