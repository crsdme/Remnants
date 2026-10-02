import type {
  GetStockLotsRequest,
  GetStockLotsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getStockLots(params: GetStockLotsRequest) {
  return api.get<GetStockLotsResponse>('stock-lots/get', { params })
}
