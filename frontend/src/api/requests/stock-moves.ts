import type {
  GetStockMovesRequest,
  GetStockMovesResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getStockMoves(params: GetStockMovesRequest) {
  return api.get<GetStockMovesResponse>('stock-moves/get', { params })
}
