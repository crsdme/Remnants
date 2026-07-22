import type {
  AuthUser,
  CreateOrderSourceResponse,
  EditOrderSourceResponse,
  GetOrderSourcesResponse,
  RemoveOrderSourcesResponse,
} from '@remnant/shared'
import type {
  CreateOrderSourcePayload,
  EditOrderSourcePayload,
  GetOrderSourcesPayload,
  RemoveOrderSourcesPayload,
} from '@/types'
import { mapOrderSourceToDTO } from '@/mappers/'
import * as OrderSourceRepo from '@/repositories/order-source.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import { getScopeIdsForUser, HttpError } from '@/utils/'

export async function get({
  payload,
  user,
}: {
  payload: GetOrderSourcesPayload
  user: AuthUser
}): Promise<GetOrderSourcesResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getScopeIdsForUser(access, 'orderSources', user)

  const { items, total, page, pageSize } = await OrderSourceRepo.list(payload, { scopeIds })

  return {
    status: 'success',
    code: 'ORDER_SOURCES_FETCHED',
    message: 'Order sources fetched',
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

export async function create({ payload }: { payload: CreateOrderSourcePayload }): Promise<CreateOrderSourceResponse> {
  const orderSource = await OrderSourceRepo.createOne(payload)

  return {
    status: 'success',
    code: 'ORDER_SOURCE_CREATED',
    message: 'Order source created',
    data: mapOrderSourceToDTO(orderSource),
  }
}

export async function edit({ payload }: { payload: EditOrderSourcePayload }): Promise<EditOrderSourceResponse> {
  const { id } = payload

  const orderSource = await OrderSourceRepo.updateById(id, payload)

  if (!orderSource)
    throw new HttpError(400, 'Order source not edited', 'ORDER_SOURCE_NOT_EDITED')

  return {
    status: 'success',
    code: 'ORDER_SOURCE_EDITED',
    message: 'Order source edited',
    data: mapOrderSourceToDTO(orderSource),
  }
}

export async function remove({ payload }: { payload: RemoveOrderSourcesPayload }): Promise<RemoveOrderSourcesResponse> {
  for (const id of payload.ids) {
    await OrderSourceRepo.removeById(id)
  }

  return {
    status: 'success',
    code: 'ORDER_SOURCES_REMOVED',
    message: 'Order sources removed',
  }
}
