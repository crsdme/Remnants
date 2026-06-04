import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface ClientDTO {
  id: IdType
  seq: number
  name: string
  middleName: string
  lastName: string
  emails: string[]
  phones: string[]
  addresses: string[]
  socials: {
    type: string
    value: string
  }[]
  country: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

export type GetClientsResponse = ResponseList<ClientDTO>

export type CreateClientResponse = ResponseItem<ClientDTO>

export type EditClientResponse = ResponseItem<ClientDTO>

export type RemoveClientsResponse = Response
