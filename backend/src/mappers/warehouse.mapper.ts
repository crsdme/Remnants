import type { WarehouseDTO } from '@remnant/shared'
import type { WarehouseDB } from '@/types/'

export function mapWarehouseToDTO(warehouse: WarehouseDB): WarehouseDTO {
  return {
    id: warehouse._id,
    names: warehouse.names,
    priority: warehouse.priority,
    active: warehouse.active,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  }
}
