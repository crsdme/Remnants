import type { ProductPropertyGroupDTO } from '@remnant/shared'
import type { ProductPropertyGroupDB } from '@/types/'

export function mapProductPropertyGroupToDTO(productPropertyGroup: ProductPropertyGroupDB): ProductPropertyGroupDTO {
  return {
    id: productPropertyGroup._id,
    names: productPropertyGroup.names,
    productProperties: productPropertyGroup.productProperties,
    priority: productPropertyGroup.priority,
    active: productPropertyGroup.active,
    createdAt: productPropertyGroup.createdAt,
    updatedAt: productPropertyGroup.updatedAt,
  }
}
