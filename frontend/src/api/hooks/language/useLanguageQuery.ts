import type { GetLanguagesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getLanguages } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useLanguageQuery(params: GetLanguagesRequest, settings?: QuerySettings<typeof getLanguages>) {
  const query = useQuery({
    queryKey: ['languages', 'get', params],
    queryFn: async () => getLanguages(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const languages = listData?.items ?? EMPTY_ITEMS
  const languagesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    languages,
    languagesCount,
  }
}
