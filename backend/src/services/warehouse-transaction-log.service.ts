import type {
  AuthUser,
  CreateWarehouseTransactionLogsResponse,
  GetWarehouseTransactionLogsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CreateWarehouseTransactionLogsPayload,
  GetWarehouseTransactionLogsPayload,
} from '@/types/'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as WarehouseTransactionLogRepo from '@/repositories/warehouse-transaction-log.repo'
import { getEntityIdsWithCapabilityForUser } from '@/utils'

export async function get({
  payload,
  user,
}: {
  payload: GetWarehouseTransactionLogsPayload
  user: AuthUser
}): Promise<GetWarehouseTransactionLogsResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const warehouseIds = getEntityIdsWithCapabilityForUser(access, 'warehouses', 'viewHistory', user)

  const { items, total, page, pageSize } = await WarehouseTransactionLogRepo.list(payload, { warehouseIds })

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_LOGS_FETCHED',
    message: 'Warehouse transaction logs fetched',
    data: {
      items,
      pagination: {
        total,
        page,
        pageSize,
      },
    },
  }
}

export async function create(payload: CreateWarehouseTransactionLogsPayload, session?: ClientSession): Promise<CreateWarehouseTransactionLogsResponse> {
  await WarehouseTransactionLogRepo.createOne({ payload, session })

  return {
    status: 'success',
    code: 'WAREHOUSE_TRANSACTION_LOG_CREATED',
    message: 'Warehouse transaction log created',
  }
}
