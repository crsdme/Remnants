import type { GetUserProfileSummaryRequest } from '@remnant/shared'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getUserProfileSummary } from '@/api/requests'

export function useUserProfileSummaryQuery(
  params: GetUserProfileSummaryRequest,
  settings?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: ['user-profiles', 'summary', params],
    queryFn: async () => getUserProfileSummary(params),
    staleTime: 15000,
    placeholderData: keepPreviousData,
    enabled: Boolean(params.userId) && (settings?.enabled ?? true),
  })

  return {
    ...query,
    summary: query.data?.data?.data ?? null,
  }
}
