import type { createSitesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createSite } from '@/api/requests'

export function useSiteCreate(settings?: MutationSettings<createSitesParams, typeof createSite>) {
  return useMutation({
    mutationFn: createSite,
    ...settings?.options,
  })
}
