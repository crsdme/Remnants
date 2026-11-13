import type {
  AuthUser,
  CreateOrderStatusResponse,
  EditOrderStatusResponse,
  GetOrderStatusesResponse,
  RemoveOrderStatusesResponse,
} from '@remnant/shared'
import type {
  CreateOrderStatusPayload,
  EditOrderStatusPayload,
  GetOrderStatusesPayload,
  RemoveOrderStatusesPayload,
} from '@/types'
import { mapOrderStatusToDTO } from '@/mappers'
import * as OrderStatusRepo from '@/repositories/order-status.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { getScopeIdsForUser, HttpError } from '@/utils/'

export async function get({
  payload,
  user,
}: {
  payload: GetOrderStatusesPayload
  user: AuthUser
}): Promise<GetOrderStatusesResponse> {
  const access = await UserAccessRepo.getScopesByUserId(user.id)
  const scopeIds = getScopeIdsForUser(access, 'orderStatusIds', user)

  const { items, total, page, pageSize } = await OrderStatusRepo.list(payload, { scopeIds })

  return {
    status: 'success',
    code: 'ORDER_STATUSES_FETCHED',
    message: 'Order statuses fetched',
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

export async function create({ payload, user }: { payload: CreateOrderStatusPayload, user?: AuthUser }): Promise<CreateOrderStatusResponse> {
  const orderStatus = await OrderStatusRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'order-status',
    resourceId: orderStatus._id.toString(),
    action: 'create',
    before: null,
    after: orderStatus,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'ORDER_STATUS_CREATED',
    message: 'Order status created',
    data: mapOrderStatusToDTO(orderStatus),
  }
}

export async function edit({ payload, user }: { payload: EditOrderStatusPayload, user?: AuthUser }): Promise<EditOrderStatusResponse> {
  const { id } = payload

  const before = await OrderStatusRepo.findById(id)
  const orderStatus = await OrderStatusRepo.updateById(id, payload)

  if (!orderStatus) {
    throw new HttpError(400, 'Order status not edited', 'ORDER_STATUS_NOT_EDITED')
  }

  await AuditLogsService.record({
    resourceType: 'order-status',
    resourceId: orderStatus._id.toString(),
    action: 'edit',
    before,
    after: orderStatus,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'ORDER_STATUS_EDITED',
    message: 'Order status edited',
    data: mapOrderStatusToDTO(orderStatus),
  }
}

export async function remove({ payload, user }: { payload: RemoveOrderStatusesPayload, user?: AuthUser }): Promise<RemoveOrderStatusesResponse> {
  for (const id of payload.ids) {
    const orderStatus = await OrderStatusRepo.removeById(id)

    if (!orderStatus)
      continue

    await AuditLogsService.record({
      resourceType: 'order-status',
      resourceId: id,
      action: 'remove',
      before: orderStatus,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'ORDER_STATUSES_REMOVED',
    message: 'Order statuses removed',
  }
}
