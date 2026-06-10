import type {
  CreateCashregisterResponse,
  EditCashregisterResponse,
  GetCashregistersResponse,
  RemoveCashregistersResponse,
} from '@remnant/shared'
import type {
  CreateCashregisterPayload,
  EditCashregisterPayload,
  GetCashregistersPayload,
  RemoveCashregistersPayload,
} from '@/types'
import { mapCashregisterToDTO } from '@/mappers/'
import * as cashregisterRepo from '@/repositories/cashregisters.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetCashregistersPayload }): Promise<GetCashregistersResponse> {
  const { items, total, page, pageSize } = await cashregisterRepo.list(payload)

  return {
    status: 'success',
    code: 'CASHREGISTERS_FETCHED',
    message: 'Cashregisters fetched',
    data: {
      items,
      pagination: { page, pageSize, total },
    },
  }
}

export async function create({ payload }: { payload: CreateCashregisterPayload }): Promise<CreateCashregisterResponse> {
  const cashregister = await cashregisterRepo.createOne(payload)

  if (cashregister === undefined)
    throw new HttpError(400, 'Cashregister not created', 'CASHREGISTER_NOT_CREATED')

  return {
    status: 'success',
    code: 'CASHREGISTER_CREATED',
    message: 'Cashregister created',
    data: mapCashregisterToDTO(cashregister),
  }
}

export async function edit({ payload }: { payload: EditCashregisterPayload }): Promise<EditCashregisterResponse> {
  const cashregister = await cashregisterRepo.updateById(payload.id, payload)

  if (!cashregister) {
    throw new HttpError(400, 'Cashregister not edited', 'CASHREGISTER_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'CASHREGISTER_EDITED',
    message: 'Cashregister edited',
    data: mapCashregisterToDTO(cashregister),
  }
}

export async function remove({ payload }: { payload: RemoveCashregistersPayload }): Promise<RemoveCashregistersResponse> {
  for (const id of payload.ids) {
    const cashregisters = await cashregisterRepo.removeById(id)

    if (!cashregisters)
      continue
  }

  return {
    status: 'success',
    code: 'CASHREGISTERS_REMOVED',
    message: 'Cashregisters removed',
  }
}
