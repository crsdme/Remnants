import type { GetSitesRequest, SiteDTO } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getSites } from '@/api/requests'

export function useSiteOptions({ defaultFilters }: { defaultFilters?: GetSitesRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query, selectedValue }: { query: string, selectedValue?: string[] }): Promise<SiteDTO[]> => {
      const params: GetSitesRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['sites', 'get', params],
        queryFn: async () => getSites(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? []
    },
    [queryClient],
  )
}

// import { useQueryClient } from '@tanstack/react-query'
// import { getSites } from '@/api/requests'

// interface DefaultFilters {
//   ids?: string[]
//   sites?: string[]
// }

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// export function useSiteOptions({ defaultFilters }: { defaultFilters?: DefaultFilters } = {}) {
//   const queryClient = useQueryClient()

//   return async function loadSiteOptions({ query, selectedValue }: LoadOptionsParams): Promise<Site[]> {
//     const filters = {
//       ...(selectedValue ? { ids: selectedValue } : { names: query }),
//       ...defaultFilters,
//     }
//     const pagination = { full: true }

//     const data = await queryClient.fetchQuery({
//       queryKey: ['sites', 'get', pagination, filters],
//       queryFn: () => getSites({ pagination, filters }),
//       staleTime: 60000,
//     })

//     return data?.data?.sites || []
//   }
// }
