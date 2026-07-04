import type {
  CreateUnitResponse,
  EditUnitResponse,
  GetUnitsResponse,
  RemoveUnitsResponse,
} from '@remnant/shared'
import type { CreateUnitPayload, EditUnitPayload, GetUnitsPayload, RemoveUnitsPayload } from '@/types'
import { mapUnitToDTO } from '@/mappers/'
import * as UnitRepo from '@/repositories/unit.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetUnitsPayload }): Promise<GetUnitsResponse> {
  const { items, total, page, pageSize } = await UnitRepo.list(payload)

  return {
    status: 'success',
    code: 'UNITS_FETCHED',
    message: 'Units fetched',
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

export async function create({ payload }: { payload: CreateUnitPayload }): Promise<CreateUnitResponse> {
  const unit = await UnitRepo.createOne(payload)

  return {
    status: 'success',
    code: 'UNIT_CREATED',
    message: 'Unit created',
    data: mapUnitToDTO(unit),
  }
}

export async function edit({ payload }: { payload: EditUnitPayload }): Promise<EditUnitResponse> {
  const unit = await UnitRepo.updateById(payload.id, payload)

  if (unit === null)
    throw new HttpError(400, 'Unit not edited', 'UNIT_NOT_EDITED')

  return {
    status: 'success',
    code: 'UNIT_EDITED',
    message: 'Unit edited',
    data: mapUnitToDTO(unit),
  }
}

export async function remove({ payload }: { payload: RemoveUnitsPayload }): Promise<RemoveUnitsResponse> {
  for (const id of payload.ids) {
    const unit = await UnitRepo.removeById(id)

    if (unit === null)
      throw new HttpError(400, 'Unit not removed', 'UNIT_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'UNITS_REMOVED',
    message: 'Units removed',
  }
}
