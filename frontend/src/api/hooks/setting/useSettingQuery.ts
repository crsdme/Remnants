import type { GetSettingsRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getSettings } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useSettingQuery(params: GetSettingsRequest, settings?: QuerySettings<typeof getSettings>) {
  const query = useQuery({
    queryKey: ['settings', 'get', params],
    queryFn: async () => getSettings(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const settingsData = listData?.items ?? EMPTY_ITEMS
  const settingsCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    settings: settingsData,
    settingsCount,
  }
}
