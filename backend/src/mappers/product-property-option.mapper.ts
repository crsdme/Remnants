import type { ProductPropertyOptionDTO } from '@remnant/shared'
import type { ProductPropertyOptionDB } from '@/types/'

export function mapProductPropertyOptionToDTO(productPropertyOption: ProductPropertyOptionDB): ProductPropertyOptionDTO {
  return {
    id: productPropertyOption._id,
    names: productPropertyOption.names,
    priority: productPropertyOption.priority,
    active: productPropertyOption.active,
    color: productPropertyOption.color,
    productProperty: productPropertyOption.productProperty,
    createdAt: productPropertyOption.createdAt,
    updatedAt: productPropertyOption.updatedAt,
  }
}
