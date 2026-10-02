import type { SupplierDTO } from '@remnant/shared'
import type { SupplierDB } from '@/types/'

export function mapSupplierToDTO(supplier: SupplierDB): SupplierDTO {
  return {
    id: supplier._id,
    seq: supplier.seq ?? 0,
    name: supplier.name,
    emails: supplier.emails ?? [],
    phones: supplier.phones ?? [],
    socials: supplier.socials ?? [],
    comment: supplier.comment,
    removed: supplier.removed,
    debts: [],
    payments: [],
    balances: [],
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,
  }
}
