import type { InventoryDTO } from '@remnant/shared'
import type { InventoryDB } from '@/types/'

export function mapInventoryToDTO(inventory: InventoryDB): InventoryDTO {
  return {
    id: inventory._id,
    status: inventory.status,
    warehouse: inventory.warehouse,
    createdBy: inventory.createdBy,
    removedBy: inventory.removedBy,
    comment: inventory.comment,
    removedAt: inventory.removedAt,
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt,
  }
}
