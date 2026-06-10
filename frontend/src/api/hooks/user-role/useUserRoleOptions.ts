import type { GetUserRoleRequest, UserRoleDTO } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { getUserRoles } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useUserRoleOptions({ defaultFilters }: { defaultFilters?: GetUserRoleRequest['filters'] } = {}) {
  const queryClient = useQueryClient()

  return useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}): Promise<UserRoleDTO[]> => {
      const params: GetUserRoleRequest = {
        pagination: { full: true },
        filters: {
          ...(selectedValue ? { ids: selectedValue } : { names: query }),
          ...defaultFilters,
        },
      }

      const { data } = await queryClient.fetchQuery({
        queryKey: ['user-roles', 'get', params],
        queryFn: async () => getUserRoles(params),
        staleTime: 60000,
      })

      return data?.data?.items ?? EMPTY_ITEMS
    },
    [queryClient],
  )
}

// import { useQueryClient } from '@tanstack/react-query'
// import { useTranslation } from 'react-i18next'
// import { getUserRoles } from '@/api/requests'

// interface LoadOptionsParams {
//   query: string
//   selectedValue?: string[]
// }

// export function useUserRoleOptions() {
//   const queryClient = useQueryClient()
//   const { i18n } = useTranslation()

//   return async function loadUserRoleOptions({ query, selectedValue }: LoadOptionsParams): Promise<UserRole[]> {
//     const filters = {
//       ...(selectedValue ? { ids: selectedValue } : { names: query }),
//       active: [true],
//       language: i18n.language,
//     }

//     const data = await queryClient.fetchQuery({
//       queryKey: ['user-roles', 'get', { full: true }, filters, undefined],
//       queryFn: () => getUserRoles({ pagination: { full: true }, filters }),
//       staleTime: 60000,
//     })

//     return data?.data?.userRoles || []
//   }
// }
