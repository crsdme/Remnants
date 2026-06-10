import type { CreateSiteRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createSite } from '@/api/requests'

export function useSiteCreate(settings?: MutationSettings<CreateSiteRequest>) {
  return useMutation({
    mutationFn: createSite,
    ...settings?.options,
  })
}
