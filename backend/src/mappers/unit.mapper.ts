import type { UnitDTO } from '@remnant/shared'
import type { UnitDB } from '@/types/'

export function mapUnitToDTO(unit: UnitDB): UnitDTO {
  return {
    id: unit._id,
    names: unit.names,
    symbols: unit.symbols,
    priority: unit.priority,
    active: unit.active,
    createdAt: unit.createdAt,
    updatedAt: unit.updatedAt,
  }
}
