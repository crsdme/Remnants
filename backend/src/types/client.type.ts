import type {
  ClientDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { clientDBSchema } from '../schemas'
import {
  createClientSchema,
  editClientSchema,
  getClientsSchema,
  removeClientsSchema,
} from '@remnant/shared'

export type ClientDB = z.infer<typeof clientDBSchema>

export type GetClientsPayload = z.output<typeof getClientsSchema>
export function parseGetClients(x: unknown): GetClientsPayload {
  return getClientsSchema.parse(x)
}

export type CreateClientPayload = z.output<typeof createClientSchema>
export function parseCreateClient(x: unknown): CreateClientPayload {
  return createClientSchema.parse(x)
}

export type EditClientPayload = z.output<typeof editClientSchema>
export function parseEditClient(x: unknown): EditClientPayload {
  return editClientSchema.parse(x)
}

export type RemoveClientsPayload = z.output<typeof removeClientsSchema>
export function parseRemoveClients(x: unknown): RemoveClientsPayload {
  return removeClientsSchema.parse(x)
}

export type GetClientsRepoPayload = GetClientsPayload
export interface GetClientsRepoResult { items: ClientDTO[], total: number, page: number, pageSize: number }

export type CreateClientsRepoPayload = CreateClientPayload

export type EditClientsRepoPayload = EditClientPayload
