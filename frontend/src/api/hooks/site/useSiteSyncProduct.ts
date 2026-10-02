import type { SyncSiteProductRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { syncSiteProduct } from '@/api/requests'

export function useSiteSyncProduct(settings?: MutationSettings<SyncSiteProductRequest>) {
  return useMutation({
    mutationFn: syncSiteProduct,
    ...settings?.options,
  })
}
