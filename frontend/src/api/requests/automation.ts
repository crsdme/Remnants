import type {
  CreateAutomationRequest,
  CreateAutomationResponse,
  EditAutomationRequest,
  EditAutomationResponse,
  GetAutomationsRequest,
  GetAutomationsResponse,
  RemoveAutomationsRequest,
  RemoveAutomationsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getAutomations(params: GetAutomationsRequest) {
  return api.get<GetAutomationsResponse>('automations/get', { params })
}

export async function createAutomation(params: CreateAutomationRequest) {
  return api.post<CreateAutomationResponse>('automations/create', { ...params })
}

export async function editAutomation(params: EditAutomationRequest) {
  return api.post<EditAutomationResponse>('automations/edit', params)
}

export async function removeAutomation(params: RemoveAutomationsRequest) {
  return api.post<RemoveAutomationsResponse>('automations/remove', params)
}
