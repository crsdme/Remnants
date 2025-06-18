import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getUserRoles } from '@/api/requests'

interface LoadOptionsParams {
  query: string
  selectedValue?: string[]
}

export function useUserRoleOptions() {
  const queryClient = useQueryClient()
  const { i18n } = useTranslation()

  return async function loadUserRoleOptions({ query, selectedValue }: LoadOptionsParams): Promise<UserRole[]> {
    const filters = {
      ...(selectedValue ? { ids: selectedValue } : { names: query }),
      active: [true],
      language: i18n.language,
    }

    const data = await queryClient.fetchQuery({
      queryKey: ['user-roles', 'get', { full: true }, filters, undefined],
      queryFn: () => getUserRoles({ pagination: { full: true }, filters }),
      staleTime: 60000,
    })

    return data?.data?.userRoles || []
  }
}
