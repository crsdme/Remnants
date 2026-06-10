import type {
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
import * as WarehouseRepo from '@/repositories/warehouse.repo'
import { HttpError } from '@/utils/httpError'

export async function get({ payload }: { payload: GetWarehousesPayload }): Promise<GetWarehousesResponse> {
  const { items, total, page, pageSize } = await WarehouseRepo.list(payload)

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

export async function create({ payload }: { payload: CreateWarehousePayload }): Promise<CreateWarehousesResponse> {
  console.log('payload', payload)
  const data = await WarehouseRepo.createOne(payload)

  return {
    status: 'success',
    code: 'WAREHOUSE_CREATED',
    message: 'Warehouse created',
    data: mapWarehouseToDTO(data),
  }
}

export async function edit({ payload }: { payload: EditWarehousePayload }): Promise<EditWarehousesResponse> {
  const { id } = payload

  const warehouse = await WarehouseRepo.updateById(id, payload)

  if (!warehouse)
    throw new HttpError(400, 'Warehouse not edited', 'WAREHOUSE_NOT_EDITED')

  return {
    status: 'success',
    code: 'WAREHOUSE_EDITED',
    message: 'Warehouse edited',
    data: mapWarehouseToDTO(warehouse),
  }
}

export async function remove({ payload }: { payload: RemoveWarehousesPayload }): Promise<RemoveWarehousesResponse> {
  for (const id of payload.ids) {
    const warehouse = await WarehouseRepo.removeById(id)

    if (!warehouse)
      throw new HttpError(400, 'Warehouse not removed', 'WAREHOUSE_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'WAREHOUSES_REMOVED',
    message: 'Warehouses removed',
  }
}
