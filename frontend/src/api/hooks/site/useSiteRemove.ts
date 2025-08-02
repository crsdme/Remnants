import type { removeSitesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeSite } from '@/api/requests'

export function useSiteRemove(settings?: MutationSettings<removeSitesParams, typeof removeSite>) {
  return useMutation({
    mutationFn: removeSite,
    ...settings?.options,
  })
}
