import type { ProductPropertyDTO } from '@remnant/shared'
import type { ProductPropertyDB } from '@/types/'

export function mapProductPropertyToDTO(productProperty: ProductPropertyDB): ProductPropertyDTO {
  return {
    id: productProperty._id,
    names: productProperty.names,
    symbols: productProperty.symbols,
    optionIds: productProperty.optionIds,
    priority: productProperty.priority,
    type: productProperty.type,
    isRequired: productProperty.isRequired,
    showInTable: productProperty.showInTable,
    showInStatistics: productProperty.showInStatistics,
    active: productProperty.active,
    createdAt: productProperty.createdAt,
    updatedAt: productProperty.updatedAt,
  }
}
