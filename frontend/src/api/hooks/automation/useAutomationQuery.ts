import type { getAutomationsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getAutomations } from '@/api/requests'

export function useAutomationQuery(params: getAutomationsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['automations', 'get', params],
    queryFn: () => getAutomations(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
