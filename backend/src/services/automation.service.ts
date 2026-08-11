import type {
  CreateAutomationResponse,
  EditAutomationResponse,
  GetAutomationsResponse,
  RemoveAutomationsResponse,
  RunAutomationsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  AutomationActionDB,
  CreateAutomationPayload,
  EditAutomationPayload,
  GetAutomationsPayload,
  RemoveAutomationsPayload,
  RunAutomationsPayload,
} from '@/types/'
import { mapAutomationDocToDTO } from '@/mappers'
import * as AutomationRepo from '@/repositories/automation.repo'
import * as OrderRepository from '@/repositories/order.repo'
import { HttpError } from '@/utils'
import {
  matchesAutomationConditions,
  matchesAutomationTriggerParams,
} from '@/utils/automation'

export async function get({ payload }: { payload: GetAutomationsPayload }): Promise<GetAutomationsResponse> {
  const { items, total, page, pageSize } = await AutomationRepo.list(payload)

  return {
    status: 'success',
    code: 'AUTOMATIONS_FETCHED',
    message: 'Automations fetched',
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

export async function create({ payload }: { payload: CreateAutomationPayload }): Promise<CreateAutomationResponse> {
  const automation = await AutomationRepo.createOne(payload)

  return {
    status: 'success',
    code: 'AUTOMATION_CREATED',
    message: 'Automation created',
    data: mapAutomationDocToDTO(automation),
  }
}

export async function edit({ payload }: { payload: EditAutomationPayload }): Promise<EditAutomationResponse> {
  const automation = await AutomationRepo.updateById(payload.id, payload)

  if (!automation)
    throw new HttpError(400, 'Automation not edited', 'AUTOMATION_NOT_EDITED')

  return {
    status: 'success',
    code: 'AUTOMATION_EDITED',
    message: 'Automation edited',
    data: mapAutomationDocToDTO(automation),
  }
}

export async function remove({ payload }: { payload: RemoveAutomationsPayload }): Promise<RemoveAutomationsResponse> {
  for (const id of payload.ids) {
    await AutomationRepo.removeById(id)
  }

  return {
    status: 'success',
    code: 'AUTOMATION_REMOVED',
    message: 'Automation removed',
  }
}

async function executeAction({
  action,
  orderId,
  userId,
  session,
}: {
  action: AutomationActionDB
  orderId: string
  userId: string
  session?: ClientSession
}) {
  const params = (action.params ?? []).map(String)

  switch (action.field) {
    case 'order-status-update': {
      const orderStatusId = params[0]
      if (!orderStatusId)
        return
      await OrderRepository.patchById({
        id: orderId,
        payload: { orderStatusId },
        session,
      })
      return
    }
    case 'order-source-update': {
      const orderSourceId = params[0]
      if (!orderSourceId)
        return
      await OrderRepository.patchById({
        id: orderId,
        payload: { orderSourceId },
        session,
      })
      return
    }
    case 'order-delivery-service-update': {
      const deliveryServiceId = params[0]
      if (!deliveryServiceId)
        return
      await OrderRepository.patchById({
        id: orderId,
        payload: { deliveryServiceId },
        session,
      })
      return
    }
    case 'order-mark-removed': {
      await OrderRepository.removeById(orderId, { removedBy: userId, session })
      break
    }
    case 'pay-order':
      // Pay flow is not fully implemented yet; keep as a no-op action slot.
      break
    default:
  }
}

export async function run({ payload, session }: { payload: RunAutomationsPayload, session?: ClientSession }): Promise<RunAutomationsResponse> {
  const automations = await AutomationRepo.listActiveByTriggerType({
    type: payload.type,
    session,
  })

  if (!automations.length) {
    return {
      status: 'success',
      code: 'AUTOMATIONS_RAN',
      message: 'Automations run',
    }
  }

  for (const automation of automations) {
    const order = await OrderRepository.findOne({
      payload: { id: payload.entityId },
      session,
    })

    if (!order)
      throw new HttpError(404, 'Order not found', 'ORDER_NOT_FOUND')

    if (!matchesAutomationTriggerParams(order, payload.type, automation.trigger.params ?? []))
      continue

    if (!matchesAutomationConditions(order, automation.conditions ?? []))
      continue

    for (const action of automation.actions ?? []) {
      await executeAction({
        action,
        orderId: order._id.toString(),
        userId: payload.user,
        session,
      })
    }
  }

  return {
    status: 'success',
    code: 'AUTOMATIONS_RAN',
    message: 'Automations run',
  }
}
