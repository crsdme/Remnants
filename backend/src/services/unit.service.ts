import type {
  AuthUser,
  CreateUnitResponse,
  EditUnitResponse,
  GetUnitsResponse,
  RemoveUnitsResponse,
} from '@remnant/shared'
import type { CreateUnitPayload, EditUnitPayload, GetUnitsPayload, RemoveUnitsPayload } from '@/types'
import { mapUnitToDTO } from '@/mappers/'
import * as UnitRepo from '@/repositories/unit.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
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

export async function create({ payload, user }: { payload: CreateUnitPayload, user?: AuthUser }): Promise<CreateUnitResponse> {
  const unit = await UnitRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'unit',
    resourceId: unit._id.toString(),
    action: 'create',
    before: null,
    after: unit,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'UNIT_CREATED',
    message: 'Unit created',
    data: mapUnitToDTO(unit),
  }
}

export async function edit({ payload, user }: { payload: EditUnitPayload, user?: AuthUser }): Promise<EditUnitResponse> {
  const before = await UnitRepo.findById(payload.id)
  const unit = await UnitRepo.updateById(payload.id, payload)

  if (unit === null)
    throw new HttpError(400, 'Unit not edited', 'UNIT_NOT_EDITED')

  await AuditLogsService.record({
    resourceType: 'unit',
    resourceId: unit._id.toString(),
    action: 'edit',
    before,
    after: unit,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'UNIT_EDITED',
    message: 'Unit edited',
    data: mapUnitToDTO(unit),
  }
}

export async function remove({ payload, user }: { payload: RemoveUnitsPayload, user?: AuthUser }): Promise<RemoveUnitsResponse> {
  for (const id of payload.ids) {
    const unit = await UnitRepo.removeById(id)

    if (unit === null)
      throw new HttpError(400, 'Unit not removed', 'UNIT_NOT_REMOVED')

    await AuditLogsService.record({
      resourceType: 'unit',
      resourceId: id,
      action: 'remove',
      before: unit,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'UNITS_REMOVED',
    message: 'Units removed',
  }
}
