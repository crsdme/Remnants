import type {
  GetOrderStatisticRequest,
  GetStatisticResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getOrderStatistic(params: GetOrderStatisticRequest) {
  return api.get<GetStatisticResponse>('statistics/orders/get', { params })
}
