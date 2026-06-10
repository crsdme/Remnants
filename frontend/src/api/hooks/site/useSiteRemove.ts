import type { RemoveSitesRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeSite } from '@/api/requests'

export function useSiteRemove(settings?: MutationSettings<RemoveSitesRequest>) {
  return useMutation({
    mutationFn: removeSite,
    ...settings?.options,
  })
}
