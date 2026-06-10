import type { EditSiteRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editSite } from '@/api/requests'

export function useSiteEdit(settings?: MutationSettings<EditSiteRequest>) {
  return useMutation({
    mutationFn: editSite,
    ...settings?.options,
  })
}
