import type { GetStockMovesRequest } from '@remnant/shared'

import { useQuery } from '@tanstack/react-query'
import { getStockMoves } from '@/api/requests'

const EMPTY_ITEMS: never[] = []

export function useStockMoveQuery(params: GetStockMovesRequest, settings?: QuerySettings<typeof getStockMoves>) {
  const query = useQuery({
    queryKey: ['stock-moves', 'get', params],
    queryFn: async () => getStockMoves(params),
    staleTime: 60000,
    ...settings?.options,
  })

  const listData = query.data?.data?.data
  const stockMoves = listData?.items ?? EMPTY_ITEMS
  const stockMovesCount = listData?.pagination?.total ?? 0

  return {
    ...query,
    stockMoves,
    stockMovesCount,
  }
}
