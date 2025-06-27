import type { getSettingsParams } from '@/api/types'

import { useQuery } from '@tanstack/react-query'
import { getSettings } from '@/api/requests'

export function useSettingQuery(params: getSettingsParams, settings?: QuerySettings) {
  return useQuery({
    queryKey: ['settings', 'get', params],
    queryFn: () => getSettings(params),
    staleTime: 60000,
    ...settings?.options,
  })
}
