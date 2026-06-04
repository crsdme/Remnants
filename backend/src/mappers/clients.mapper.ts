import type { ClientDTO } from '@remnant/shared'
import type { ClientDB } from '@/types/'

export function mapClientToDTO(client: ClientDB): ClientDTO {
  return {
    id: client._id,
    seq: client.seq,
    name: client.name,
    middleName: client.middleName,
    lastName: client.lastName,
    emails: client.emails,
    phones: client.phones,
    addresses: client.addresses,
    socials: client.socials,
    country: client.country,
    comment: client.comment,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  }
}
