import type {
  AutomationResponse,
  createAutomationParams,
  editAutomationParams,
  getAutomationsParams,
  removeAutomationsParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getAutomations(params: getAutomationsParams) {
  return api.get<AutomationResponse>('automations/get', { params })
}

export async function createAutomation(params: createAutomationParams) {
  return api.post<AutomationResponse>('automations/create', { ...params })
}

export async function editAutomation(params: editAutomationParams) {
  return api.post<AutomationResponse>('automations/edit', params)
}

export async function removeAutomation(params: removeAutomationsParams) {
  return api.post<AutomationResponse>('automations/remove', params)
}
