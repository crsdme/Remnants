import type { InventoryDTO } from '@remnant/shared'

import type { InventoryDB } from '@/types/'

export function mapInventoryToDTO(inventory: InventoryDB): InventoryDTO {
  return {

    id: inventory._id,
    seq: inventory.seq,
    status: inventory.status,
    warehouse: {
      id: inventory.warehouseId,
      names: {},
    },
    categories: inventory.categoryIds.map(categoryId => ({
      id: categoryId,
      names: {},
    })),
    comment: inventory.comment,
    createdAt: inventory.createdAt,
    updatedAt: inventory.updatedAt,

  }
}
