import type { GetCategoriesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useCategoryQuery(params: GetCategoriesRequest, settings?: QuerySettings<typeof getCategories>) {
  const query = useQuery({
    queryKey: ['categories', 'get', params],
    queryFn: async () => getCategories(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const categories = listData?.items ?? EMPTY_ITEMS
  const categoriesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    categories,
    categoriesCount,
    pagination: listData?.pagination,
  }
}
