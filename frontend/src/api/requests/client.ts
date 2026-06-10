import type {
  CreateClientRequest,
  CreateClientResponse,
  EditClientRequest,
  EditClientResponse,
  GetClientsRequest,
  GetClientsResponse,
  RemoveClientsRequest,
  RemoveClientsResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getClients(params: GetClientsRequest) {
  return api.get<GetClientsResponse>('clients/get', { params })
}

export async function createClient(params: CreateClientRequest) {
  return api.post<CreateClientResponse>('clients/create', { ...params })
}

export async function editClient(params: EditClientRequest) {
  return api.post<EditClientResponse>('clients/edit', params)
}

export async function removeClient(params: RemoveClientsRequest) {
  return api.post<RemoveClientsResponse>('clients/remove', params)
}
