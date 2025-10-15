import type {
  getWarehouseTransactionsLogsParams,
  WarehouseTransactionsLogsResponse,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getWarehouseTransactionsLogs(params: getWarehouseTransactionsLogsParams) {
  return api.get<WarehouseTransactionsLogsResponse>('warehouse-transactions-logs/get', { params })
}
