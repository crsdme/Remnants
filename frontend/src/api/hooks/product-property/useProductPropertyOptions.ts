import type { GetProductPropertyRequest, ProductPropertyDTO } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getProductProperties } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useProductPropertyOptions({ defaultFilters }: { defaultFilters?: GetProductPropertyRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<ProductPropertyDTO[]> => {
      const params: GetProductPropertyRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['product-properties', 'get', params],
        queryFn: async () => getProductProperties(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}

// import { useQueryClient } from '@tanstack/react-query'
// import { useTranslation } from 'react-i18next'
// import { getProductProperties } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// export function useProductPropertyOptions() {
//   const queryClient = useQueryClient()
//   const { i18n } = useTranslation()

//   return async function loadProductPropertyOptions({ query, selectedValue }: LoadOptionsParams): Promise<ProductPropertyDTO[]> {
//     const filters = {
//       ...(selectedValue ? { ids: selectedValue } : { names: query }),
//       active: [true],
//       language: i18n.language,
//     }

//     const data = await queryClient.fetchQuery({
//       queryKey: ['product-properties', 'get', { full: true }, filters, undefined],
//       queryFn: () => getProductProperties({ pagination: { full: true }, filters }),
//       staleTime: 60000,
//     })

//     return data?.data?.productProperties || []
//   }
// }
