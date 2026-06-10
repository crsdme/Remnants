import type {
  GetWarehouseTransactionLogsRequest,
  GetWarehouseTransactionLogsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getWarehouseTransactionsLogs(params: GetWarehouseTransactionLogsRequest) {
  return api.get<GetWarehouseTransactionLogsResponse>('warehouse-transactions-logs/get', { params })
}
