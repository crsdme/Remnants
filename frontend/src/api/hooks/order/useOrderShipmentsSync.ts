import type { SyncOrderShipmentsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { syncOrderShipments } from '@/api/requests'

export function useOrderShipmentsSync(settings?: MutationSettings<SyncOrderShipmentsRequest>) {
  return useMutation({
    mutationFn: syncOrderShipments,
    ...settings?.options,
  })
}
