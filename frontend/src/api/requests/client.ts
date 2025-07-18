import type {
  ClientResponse,
  createClientParams,
  editClientParams,
  getClientsParams,
  removeClientsParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getClients(params: getClientsParams) {
  return api.get<ClientResponse>('clients/get', { params })
}

export async function createClient(params: createClientParams) {
  return api.post<ClientResponse>('clients/create', { ...params })
}

export async function editClient(params: editClientParams) {
  return api.post<ClientResponse>('clients/edit', params)
}

export async function removeClient(params: removeClientsParams) {
  return api.post<ClientResponse>('clients/remove', params)
}
