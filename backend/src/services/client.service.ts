import type {
  CreateClientResponse,
  EditClientResponse,
  GetClientsResponse,
  RemoveClientsResponse,
} from '@remnant/shared'
import type {
  CreateClientPayload,
  EditClientPayload,
  GetClientsPayload,
  RemoveClientsPayload,
} from '@/types'
import { mapClientToDTO } from '@/mappers/'
import * as clientRepo from '@/repositories/client.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetClientsPayload }): Promise<GetClientsResponse> {
  const { items, total, page, pageSize } = await clientRepo.list(payload)

  return {
    status: 'success',
    code: 'CLIENTS_FETCHED',
    message: 'Clients fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateClientPayload }): Promise<CreateClientResponse> {
  const client = await clientRepo.createOne(payload)

  return {
    status: 'success',
    code: 'CLIENT_CREATED',
    message: 'Client created',
    data: mapClientToDTO(client),
  }
}

export async function edit({ payload }: { payload: EditClientPayload }): Promise<EditClientResponse> {
  const client = await clientRepo.updateById(payload.id, payload)

  if (!client) {
    throw new HttpError(400, 'Client not edited', 'CLIENT_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'CLIENT_EDITED',
    message: 'Client edited',
    data: mapClientToDTO(client),
  }
}

export async function remove({ payload }: { payload: RemoveClientsPayload }): Promise<RemoveClientsResponse> {
  const { ids } = payload

  for (const id of ids) {
    const client = await clientRepo.removeById(id)

    if (!client)
      continue
  }

  return {
    status: 'success',
    code: 'CLIENTS_REMOVED',
    message: 'Clients removed',
  }
}
