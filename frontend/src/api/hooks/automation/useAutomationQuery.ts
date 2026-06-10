import type { GetAutomationsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getAutomations } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useAutomationQuery(params: GetAutomationsRequest, settings?: QuerySettings<typeof getAutomations>) {
  const query = useQuery({
    queryKey: ['automations', 'get', params],
    queryFn: async () => getAutomations(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const automations = listData?.items ?? EMPTY_ITEMS
  const automationsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    automations,
    automationsCount,
  }
}
