import type { ProductStockStatusDTO } from '@remnant/shared'
import type { ProductStockStatusDB } from '@/types'

function toLanguageRecord(names: ProductStockStatusDB['names'] | Map<string, string> | Record<string, string>) {
  if (names instanceof Map)
    return Object.fromEntries(names.entries())
  return names as Record<string, string>
}

export function mapProductStockStatusToDTO(status: ProductStockStatusDB | {
  _id: string
  names: ProductStockStatusDB['names'] | Map<string, string> | Record<string, string>
  priority: number
  color?: string
  active?: boolean
  isDefault?: boolean
  conditions?: ProductStockStatusDTO['conditions']
  createdAt: Date
  updatedAt: Date
}): ProductStockStatusDTO {
  return {
    id: status._id,
    names: toLanguageRecord(status.names),
    priority: status.priority,
    color: status.color,
    active: status.active ?? true,
    isDefault: status.isDefault ?? false,
    conditions: status.conditions ?? [],
    createdAt: status.createdAt,
    updatedAt: status.updatedAt,
  }
}
