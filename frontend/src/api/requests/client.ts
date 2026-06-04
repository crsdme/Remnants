import type {
  createClientParams,
  createClientResponse,
  editClientParams,
  editClientResponse,
  getClientsParams,
  getClientsResponse,
  removeClientsParams,
  removeClientsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getClients(params: getClientsParams) {
  return api.get<getClientsResponse>('clients/get', { params })
}

export async function createClient(params: createClientParams) {
  return api.post<createClientResponse>('clients/create', { ...params })
}

export async function editClient(params: editClientParams) {
  return api.post<editClientResponse>('clients/edit', params)
}

export async function removeClient(params: removeClientsParams) {
  return api.post<removeClientsResponse>('clients/remove', params)
}
