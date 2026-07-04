import type {
  CreateAutomationResponse,
  EditAutomationResponse,
  GetAutomationsResponse,
  RemoveAutomationsResponse,
  RunAutomationsResponse,
} from '@remnant/shared'
import type { ClientSession } from 'mongoose'
import type {
  CreateAutomationPayload,
  EditAutomationPayload,
  GetAutomationsPayload,
  RemoveAutomationsPayload,
  RunAutomationsPayload,
} from '@/types/'
import { mapAutomationDocToDTO } from '@/mappers'
import * as AutomationRepo from '@/repositories/automation.repo'
import { HttpError } from '@/utils'

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

export async function run({ payload, session }: { payload: RunAutomationsPayload, session?: ClientSession }): Promise<RunAutomationsResponse> {
  console.log('automation run', payload.toString().slice(0, 100), session?.toString().slice(0, 100))
  return {
    status: 'success',
    code: 'AUTOMATIONS_RAN',
    message: 'Automations run',
  }
}
