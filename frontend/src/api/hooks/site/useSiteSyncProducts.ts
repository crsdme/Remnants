import type { SyncSiteProductsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { syncSiteProducts } from '@/api/requests'

export function useSiteSyncProducts(settings?: MutationSettings<SyncSiteProductsRequest>) {
  return useMutation({
    mutationFn: syncSiteProducts,
    ...settings?.options,
  })
}
