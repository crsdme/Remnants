import type {
  getOrderStatisticParams,
  OrderStatisticResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getOrderStatistic(params: getOrderStatisticParams) {
  return api.get<OrderStatisticResponse>('statistics/orders/get', { params })
}
