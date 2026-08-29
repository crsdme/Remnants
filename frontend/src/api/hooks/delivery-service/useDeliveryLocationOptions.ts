import type { DeliveryLocationDTO, DeliveryLocationKind, GetDeliveryLocationsRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getDeliveryLocations } from '@/api/requests'

const EMPTY_ITEMS: DeliveryLocationDTO[] = []

export function useDeliveryLocationOptions(params: {
  id?: string
  apiKey?: string
  type?: GetDeliveryLocationsRequest['type']
  kind: DeliveryLocationKind
  parentId?: string
  enabled?: boolean
  pinned?: DeliveryLocationDTO | null
}) {
  const queryClient = useQueryClient()
  const { id, apiKey, type = 'novaposhta', kind, parentId, enabled = true, pinned } = params

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<DeliveryLocationDTO[]> => {
      if (!enabled)
        return pinned && selectedValue?.includes(pinned.id) ? [pinned] : EMPTY_ITEMS
      if (!id && !apiKey)
        return pinned && selectedValue?.includes(pinned.id) ? [pinned] : EMPTY_ITEMS
      if ((kind === 'office' || kind === 'parcel_locker') && !parentId && !selectedValue?.length)
        return EMPTY_ITEMS

      const request: GetDeliveryLocationsRequest = {
        id,
        apiKey,
        type,
        kind,
        query,
        parentId,
      }

      try {
        const { data } = await queryClient.fetchQuery({
          queryKey: ['delivery-services', 'locations', request],
          queryFn: async () => getDeliveryLocations(request),
          staleTime: 60_000,
        })

        const items = [...(data?.data?.items ?? EMPTY_ITEMS)]

        if (pinned && !items.some(item => item.id === pinned.id))
          items.unshift(pinned)

        if (selectedValue?.length) {
          const selected = items.filter(item => selectedValue.includes(item.id))
          if (selected.length)
            return selected
        }

        return items
      }
      catch (error) {
        const apiError = (error as { response?: { data?: { error?: { message?: string, description?: string } } } }).response?.data?.error
        const message = apiError?.description || apiError?.message
        throw new Error(message || 'Failed to fetch options')
      }
    },
    [apiKey, enabled, id, kind, parentId, pinned, queryClient, type],
  )
}
