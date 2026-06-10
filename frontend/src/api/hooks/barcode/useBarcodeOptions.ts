import type { BarcodeDTO, GetBarcodesRequest } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getBarcodes } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useBarcodeOptions() {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query, selectedValue }: { query: string, selectedValue?: string[] }): Promise<BarcodeDTO[]> => {
      const params: GetBarcodesRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue?.length ? { ids: selectedValue } : { codes: query ? [query] : [] }),
          active: [true],
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['barcodes', 'get', params],
        queryFn: async () => getBarcodes(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}
