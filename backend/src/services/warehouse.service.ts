import type {
  AuthUser,
  CreateWarehousesResponse,
  EditWarehousesResponse,
  GetWarehousesResponse,
  RemoveWarehousesResponse,
} from '@remnant/shared'
import type {
  CreateWarehousePayload,
  EditWarehousePayload,
  GetWarehousesPayload,
  RemoveWarehousesPayload,
} from '@/types/'
import { mapWarehouseToDTO } from '@/mappers/'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as WarehouseRepo from '@/repositories/warehouse.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { getEntityIdsForUser, HttpError } from '@/utils'

export async function get({ payload, user }: { payload: GetWarehousesPayload, user: AuthUser }): Promise<GetWarehousesResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getEntityIdsForUser(access, 'warehouses', user)

  const { items, total, page, pageSize } = await WarehouseRepo.list(payload, { scopeIds })

  return {
    status: 'success',
    code: 'WAREHOUSES_FETCHED',
    message: 'Warehouses fetched',
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

export async function create({ payload, user }: { payload: CreateWarehousePayload, user?: AuthUser }): Promise<CreateWarehousesResponse> {
  const data = await WarehouseRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'warehouse',
    resourceId: data._id.toString(),
    action: 'create',
    before: null,
    after: data,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'WAREHOUSE_CREATED',
    message: 'Warehouse created',
    data: mapWarehouseToDTO(data),
  }
}

export async function edit({ payload, user }: { payload: EditWarehousePayload, user?: AuthUser }): Promise<EditWarehousesResponse> {
  const { id } = payload

  const before = await WarehouseRepo.findById(id)
  const warehouse = await WarehouseRepo.updateById(id, payload)

  if (!warehouse)
    throw new HttpError(400, 'Warehouse not edited', 'WAREHOUSE_NOT_EDITED')

  await AuditLogsService.record({
    resourceType: 'warehouse',
    resourceId: warehouse._id.toString(),
    action: 'edit',
    before,
    after: warehouse,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'WAREHOUSE_EDITED',
    message: 'Warehouse edited',
    data: mapWarehouseToDTO(warehouse),
  }
}

export async function remove({ payload, user }: { payload: RemoveWarehousesPayload, user?: AuthUser }): Promise<RemoveWarehousesResponse> {
  for (const id of payload.ids) {
    const warehouse = await WarehouseRepo.removeById(id)

    if (!warehouse)
      throw new HttpError(400, 'Warehouse not removed', 'WAREHOUSE_NOT_REMOVED')

    await AuditLogsService.record({
      resourceType: 'warehouse',
      resourceId: id,
      action: 'remove',
      before: warehouse,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'WAREHOUSES_REMOVED',
    message: 'Warehouses removed',
  }
}
